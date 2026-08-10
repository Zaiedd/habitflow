import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PlanCode, SubscriptionStatus, prisma } from '@habitflow/db';
import { BillingService } from './billing.service';

jest.mock('@habitflow/db', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    subscription: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
  PlanCode: {
    FREE: 'FREE',
    PRO_MONTHLY: 'PRO_MONTHLY',
    PRO_ANNUAL: 'PRO_ANNUAL',
    FAMILY_MONTHLY: 'FAMILY_MONTHLY',
    FAMILY_ANNUAL: 'FAMILY_ANNUAL',
  },
  SubscriptionStatus: {
    ACTIVE: 'ACTIVE',
    TRIALING: 'TRIALING',
    PAST_DUE: 'PAST_DUE',
    CANCELED: 'CANCELED',
    UNPAID: 'UNPAID',
  },
}));

jest.mock('stripe', () => {
  class MockStripe {
    constructor(key: string) {
      this._key = key;
    }
    _key!: string;
  }
  const proto = MockStripe.prototype as unknown as Record<string, unknown>;
  proto.checkout = { sessions: { create: jest.fn() } };
  proto.billingPortal = { sessions: { create: jest.fn() } };
  proto.customers = { create: jest.fn() };
  proto.webhooks = { constructEvent: jest.fn() };
  return { __esModule: true, default: MockStripe };
});

import Stripe from 'stripe';

type StripeSurface = {
  checkout: { sessions: { create: jest.Mock } };
  billingPortal: { sessions: { create: jest.Mock } };
  customers: { create: jest.Mock };
  webhooks: { constructEvent: jest.Mock };
};

describe('BillingService', () => {
  let service: BillingService;
  let stripeInstance: StripeSurface;

  const mockedPrisma = prisma as unknown as {
    user: Record<string, jest.Mock>;
    subscription: Record<string, jest.Mock>;
  };

  const user = {
    id: 'u1',
    email: 'sara@example.com',
    displayName: 'Sara Hassan',
    plan: PlanCode.FREE,
  };

  const env: Record<string, string> = {
    STRIPE_SECRET_KEY: 'sk_test_123',
    STRIPE_WEBHOOK_SECRET: 'whsec_123',
    STRIPE_PRICE_PRO_MONTHLY: 'price_pro_monthly',
    STRIPE_PRICE_PRO_ANNUAL: 'price_pro_annual',
    STRIPE_PRICE_FAMILY_MONTHLY: 'price_family_monthly',
    STRIPE_PRICE_FAMILY_ANNUAL: 'price_family_annual',
    WEB_APP_URL: 'https://app.example.com',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => env[key]),
            getOrThrow: jest.fn((key: string) => {
              if (!env[key]) throw new Error(`missing ${key}`);
              return env[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(BillingService);
    stripeInstance = Stripe.prototype as unknown as StripeSurface;
  });

  describe('isConfigured', () => {
    it('is true when a secret key is present', () => {
      expect(service.isConfigured).toBe(true);
    });
  });

  describe('getSubscription', () => {
    it('returns the plan and the active subscription', async () => {
      const subscription = {
        id: 'sub1',
        userId: 'u1',
        planCode: PlanCode.PRO_ANNUAL,
        status: SubscriptionStatus.ACTIVE,
      };
      mockedPrisma.user.findUnique.mockResolvedValue(user);
      mockedPrisma.subscription.findFirst.mockResolvedValue(subscription);

      const result = await service.getSubscription('u1');

      expect(result).toEqual({ plan: PlanCode.FREE, subscription });
      expect(mockedPrisma.subscription.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'u1' }),
        }),
      );
    });

    it('returns a null subscription when the user has none', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(user);
      mockedPrisma.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getSubscription('u1');

      expect(result.subscription).toBeNull();
    });
  });

  describe('checkout', () => {
    it('creates a checkout session with the configured price and trial', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(user);
      mockedPrisma.subscription.findFirst.mockResolvedValue(null);
      stripeInstance.customers.create.mockResolvedValue({ id: 'cus_1' });
      stripeInstance.checkout.sessions.create.mockResolvedValue({
        url: 'https://checkout.stripe.com/c/pay',
      });

      const result = await service.checkout('u1', 'pro', 'year', 'ar');

      expect(stripeInstance.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'sara@example.com',
          metadata: { userId: 'u1' },
        }),
      );
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_1',
          line_items: [{ price: 'price_pro_annual', quantity: 1 }],
          subscription_data: { trial_period_days: 14 },
          metadata: { userId: 'u1', plan: 'pro', interval: 'year' },
          allow_promotion_codes: true,
          success_url: 'https://app.example.com/ar/profile?checkout=success',
          cancel_url: 'https://app.example.com/ar/#pricing',
        }),
      );
      expect(mockedPrisma.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ stripeCustomerId: 'cus_1' }),
        }),
      );
      expect(result).toEqual({ url: 'https://checkout.stripe.com/c/pay' });
    });

    it('reuses an existing Stripe customer', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(user);
      mockedPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub0',
        userId: 'u1',
        stripeCustomerId: 'cus_existing',
      });
      stripeInstance.checkout.sessions.create.mockResolvedValue({
        url: 'https://checkout.stripe.com/c/pay',
      });

      await service.checkout('u1', 'family', 'month', 'en');

      expect(stripeInstance.customers.create).not.toHaveBeenCalled();
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing' }),
      );
    });

    it('throws when the user does not exist', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.checkout('missing', 'pro', 'month'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when a price is not configured', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(user);
      env.STRIPE_PRICE_PRO_MONTHLY = '';

      await expect(
        service.checkout('u1', 'pro', 'month'),
      ).rejects.toBeInstanceOf(BadRequestException);

      env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly';
    });
  });

  describe('portal', () => {
    it('creates a billing portal session', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(user);
      mockedPrisma.subscription.findFirst.mockResolvedValue(null);
      stripeInstance.customers.create.mockResolvedValue({ id: 'cus_1' });
      stripeInstance.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/p/session',
      });

      const result = await service.portal('u1');

      expect(stripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_1',
          return_url: 'https://app.example.com/en/profile',
        }),
      );
      expect(result.url).toBe('https://billing.stripe.com/p/session');
    });
  });

  describe('handleWebhook', () => {
    it('rejects a request without a signature', async () => {
      await expect(
        service.handleWebhook({ rawBody: Buffer.from('{}') }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a bad signature', async () => {
      stripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('signature mismatch');
      });

      await expect(
        service.handleWebhook({
          headers: { 'stripe-signature': 't=1,v1=bad' },
          rawBody: Buffer.from('{}'),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('provisions a plan after checkout.session.completed', async () => {
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'u1',
            metadata: { plan: 'family', interval: 'year' },
            subscription: 'sub_1',
            customer: 'cus_1',
          },
        },
      });
      mockedPrisma.subscription.findFirst.mockResolvedValue(null);

      await service.handleWebhook({
        headers: { 'stripe-signature': 't=1,v1=ok' },
        rawBody: Buffer.from('{}'),
      });

      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: { plan: PlanCode.FAMILY_ANNUAL },
        }),
      );
      expect(mockedPrisma.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            planCode: PlanCode.FAMILY_ANNUAL,
            stripeSubscriptionId: 'sub_1',
            stripeCustomerId: 'cus_1',
          }),
        }),
      );
    });

    it('updates an existing subscription instead of creating a second one', async () => {
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'u1',
            metadata: { plan: 'pro', interval: 'month' },
            subscription: 'sub_1',
            customer: 'cus_1',
          },
        },
      });
      mockedPrisma.subscription.findFirst.mockResolvedValue({ id: 'sub0' });

      await service.handleWebhook({
        headers: { 'stripe-signature': 't=1,v1=ok' },
        rawBody: Buffer.from('{}'),
      });

      expect(mockedPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub0' },
        data: expect.objectContaining({ stripeSubscriptionId: 'sub_1' }),
      });
      expect(mockedPrisma.subscription.create).not.toHaveBeenCalled();
    });

    it('syncs status on customer.subscription.updated', async () => {
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_1',
            status: 'past_due',
            cancel_at: 2000000000,
            items: {
              data: [
                {
                  price: { id: 'price_family_annual' },
                  current_period_end: 1900000000,
                },
              ],
            },
          },
        },
      });
      mockedPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub0',
        userId: 'u1',
      });

      await service.handleWebhook({
        headers: { 'stripe-signature': 't=1,v1=ok' },
        rawBody: Buffer.from('{}'),
      });

      expect(mockedPrisma.subscription.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeSubscriptionId: 'sub_1' },
          data: expect.objectContaining({
            status: SubscriptionStatus.PAST_DUE,
            planCode: PlanCode.FAMILY_ANNUAL,
          }),
        }),
      );
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ plan: PlanCode.FAMILY_ANNUAL }),
        }),
      );
    });

    it('downgrades the user when the subscription is deleted', async () => {
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_1' } },
      });
      mockedPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub0',
        userId: 'u1',
      });

      await service.handleWebhook({
        headers: { 'stripe-signature': 't=1,v1=ok' },
        rawBody: Buffer.from('{}'),
      });

      expect(mockedPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub0' },
        data: expect.objectContaining({ status: SubscriptionStatus.CANCELED }),
      });
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: { plan: PlanCode.FREE },
        }),
      );
    });
  });
});
