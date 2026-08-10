import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PlanCode, SubscriptionStatus, prisma } from '@habitflow/db';

export type CheckoutPlan = 'pro' | 'family';
export type CheckoutInterval = 'month' | 'year';

type SubscriptionView = {
  id: string;
  planCode: PlanCode;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAt: Date | null;
};

const PRICE_KEY: Record<CheckoutPlan, Record<CheckoutInterval, string>> = {
  pro: {
    month: 'STRIPE_PRICE_PRO_MONTHLY',
    year: 'STRIPE_PRICE_PRO_ANNUAL',
  },
  family: {
    month: 'STRIPE_PRICE_FAMILY_MONTHLY',
    year: 'STRIPE_PRICE_FAMILY_ANNUAL',
  },
};

function statusFromStripe(status: string): SubscriptionStatus {
  switch (status) {
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'unpaid':
      return SubscriptionStatus.UNPAID;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe | null;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  get isConfigured(): boolean {
    return this.stripe !== null;
  }

  async getSubscription(
    userId: string,
  ): Promise<{ plan: PlanCode; subscription: SubscriptionView | null }> {
    const [user, subscription] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.subscription.findFirst({
        where: {
          userId,
          status: {
            in: [
              SubscriptionStatus.ACTIVE,
              SubscriptionStatus.TRIALING,
              SubscriptionStatus.PAST_DUE,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      plan: user?.plan ?? PlanCode.FREE,
      subscription: subscription ?? null,
    };
  }

  async checkout(
    userId: string,
    plan: CheckoutPlan,
    interval: CheckoutInterval,
    locale?: string,
  ): Promise<{ url: string }> {
    const client = this.requireClient();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('USER_NOT_FOUND');
    }

    const price = this.config.get<string>(PRICE_KEY[plan][interval]);
    if (!price) {
      throw new BadRequestException('PRICE_NOT_CONFIGURED');
    }

    const customer = await this.getOrCreateCustomer(client, user);

    const webUrl = this.appUrl();
    const session = await client.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price, quantity: 1 }],
      subscription_data: { trial_period_days: 14 },
      metadata: { userId: user.id, plan, interval },
      client_reference_id: user.id,
      allow_promotion_codes: true,
      success_url: `${webUrl}/${locale === 'ar' ? 'ar' : 'en'}/profile?checkout=success`,
      cancel_url: `${webUrl}/${locale === 'ar' ? 'ar' : 'en'}/#pricing`,
    });

    if (!session.url) {
      throw new BadRequestException('CHECKOUT_UNAVAILABLE');
    }
    return { url: session.url };
  }

  async portal(userId: string): Promise<{ url: string }> {
    const client = this.requireClient();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('USER_NOT_FOUND');
    }

    const customer = await this.getOrCreateCustomer(client, user);
    const session = await client.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${this.appUrl()}/en/profile`,
    });

    if (!session.url) {
      throw new BadRequestException('PORTAL_UNAVAILABLE');
    }
    return { url: session.url };
  }

  async handleWebhook(req: {
    headers?: Record<string, string | string[] | undefined>;
    rawBody?: Buffer;
  }): Promise<{ received: boolean }> {
    const client = this.requireClient();
    const signature = req.headers?.['stripe-signature'];
    const rawBody = req.rawBody;

    if (typeof signature !== 'string' || !rawBody) {
      throw new BadRequestException('MISSING_SIGNATURE');
    }

    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;
    try {
      event = client.webhooks.constructEvent(rawBody, signature, secret);
    } catch (error) {
      this.logger.warn(
        `Stripe webhook signature verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new BadRequestException('INVALID_SIGNATURE');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }

    return { received: true };
  }

  private async onCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.client_reference_id ?? session.metadata?.userId;
    if (!userId) return;

    const plan = this.planForSession(session);
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription?.id ?? null);
    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : (session.customer?.id ?? null);

    await prisma.user.update({ where: { id: userId }, data: { plan } });

    const existing = customerId
      ? await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        })
      : null;

    const data = {
      userId,
      planCode: plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: null,
      cancelAt: null,
    };

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.subscription.create({ data });
    }
  }

  private async onSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const status = statusFromStripe(subscription.status);
    const priceId = subscription.items.data[0]?.price.id;
    const plan = priceId ? this.planForPrice(priceId) : null;

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status,
        planCode: plan ?? undefined,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null,
        cancelAt: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null,
      },
    });

    if (plan) {
      const row = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (row) {
        await prisma.user.update({
          where: { id: row.userId },
          data: {
            plan: status === SubscriptionStatus.CANCELED ? PlanCode.FREE : plan,
          },
        });
      }
    }
  }

  private async onSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const row = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!row) return;

    await prisma.subscription.update({
      where: { id: row.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        planCode: PlanCode.FREE,
        cancelAt: null,
      },
    });
    await prisma.user.update({
      where: { id: row.userId },
      data: { plan: PlanCode.FREE },
    });
  }

  private planForSession(session: Stripe.Checkout.Session): PlanCode {
    const fromMetadata = session.metadata?.plan;
    const fromInterval = session.metadata?.interval;
    if (fromMetadata && fromInterval) {
      const plan = fromMetadata === 'family' ? 'family' : 'pro';
      const interval = fromInterval === 'year' ? 'year' : 'month';
      return this.planForCode(plan, interval);
    }

    const priceId = session.line_items?.data[0]?.price?.id;
    return priceId
      ? (this.planForPrice(priceId) ?? PlanCode.PRO_MONTHLY)
      : PlanCode.PRO_MONTHLY;
  }

  private planForPrice(priceId: string): PlanCode | null {
    const config = this.config;
    const mapping: Array<[PlanCode, string | undefined]> = [
      [PlanCode.PRO_MONTHLY, config.get(PRICE_KEY.pro.month)],
      [PlanCode.PRO_ANNUAL, config.get(PRICE_KEY.pro.year)],
      [PlanCode.FAMILY_MONTHLY, config.get(PRICE_KEY.family.month)],
      [PlanCode.FAMILY_ANNUAL, config.get(PRICE_KEY.family.year)],
    ];
    const hit = mapping.find(([, id]) => id === priceId);
    return hit ? hit[0] : null;
  }

  private planForCode(
    plan: CheckoutPlan,
    interval: CheckoutInterval,
  ): PlanCode {
    if (plan === 'family') {
      return interval === 'year'
        ? PlanCode.FAMILY_ANNUAL
        : PlanCode.FAMILY_MONTHLY;
    }
    return interval === 'year' ? PlanCode.PRO_ANNUAL : PlanCode.PRO_MONTHLY;
  }

  private async getOrCreateCustomer(
    client: Stripe,
    user: { id: string; email: string; displayName: string },
  ): Promise<{ id: string }> {
    const existing = await prisma.subscription.findFirst({
      where: { userId: user.id, stripeCustomerId: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing?.stripeCustomerId) {
      return { id: existing.stripeCustomerId };
    }

    const customer = await client.customers.create({
      email: user.email,
      name: user.displayName,
      metadata: { userId: user.id },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planCode: PlanCode.FREE,
        status: SubscriptionStatus.CANCELED,
        stripeCustomerId: customer.id,
      },
    });
    return { id: customer.id };
  }

  private requireClient(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('BILLING_NOT_CONFIGURED');
    }
    return this.stripe;
  }

  private appUrl(): string {
    return this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
  }
}
