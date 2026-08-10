import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PlanCode, prisma } from '@habitflow/db';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { RefreshDto } from './dto/refresh.dto';
import type { RegisterDto } from './dto/register.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import type { VerifyEmailDto } from './dto/verify-email.dto';

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;
const VERIFICATION_TTL_MS = 60 * 60 * 24 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: unknown; tokens: AuthTokens }> {
    const email = dto.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: dto.displayName,
        locale: dto.locale ?? 'en',
        plan: PlanCode.FREE,
        status: 'PENDING_VERIFICATION',
      },
    });

    const token = await this.createEmailVerificationToken(user.id);
    await this.safeSend(
      () =>
        this.sendVerificationEmail(
          email,
          user.displayName,
          dto.locale ?? user.locale ?? 'en',
          token,
        ),
      email,
      'verification email',
    );

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.sanitize(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: unknown; tokens: AuthTokens }> {
    const email = dto.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.sanitize(user), tokens };
  }

  async refresh(dto: RefreshDto): Promise<{ tokens: AuthTokens }> {
    const session = await prisma.session.findUnique({
      where: { refreshTokenHash: sha256(dto.refreshToken) },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(session.userId, session.user.email);
    return { tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.session.updateMany({
      where: { refreshTokenHash: sha256(refreshToken) },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<unknown> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }
    return this.sanitize(user);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ verified: boolean }> {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: sha256(dto.token) },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('INVALID_VERIFICATION_TOKEN');
    }

    if (record.user.status !== 'ACTIVE') {
      await prisma.user.update({
        where: { id: record.userId },
        data: { status: 'ACTIVE' },
      });
    }
    await prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { verified: true };
  }

  async resendVerificationEmail(
    dto: ForgotPasswordDto,
  ): Promise<{ sent: boolean }> {
    const email = dto.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.status !== 'ACTIVE') {
      const token = await this.createEmailVerificationToken(user.id);
      await this.safeSend(
        () =>
          this.sendVerificationEmail(
            email,
            user.displayName,
            dto.locale ?? user.locale ?? 'en',
            token,
          ),
        email,
        'verification email',
      );
    }

    return { sent: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ sent: boolean }> {
    const email = dto.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.passwordHash) {
      const token = await this.createPasswordResetToken(user.id);
      await this.safeSend(
        () =>
          this.sendResetPasswordEmail(
            email,
            dto.locale ?? user.locale ?? 'en',
            token,
          ),
        email,
        'password reset email',
      );
    }

    return { sent: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ ok: boolean }> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(dto.token) },
      include: { user: true },
    });

    if (
      !record ||
      record.usedAt ||
      record.expiresAt < new Date() ||
      !record.user.passwordHash
    ) {
      throw new UnauthorizedException('INVALID_RESET_TOKEN');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    await prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { ok: true };
  }

  private async createEmailVerificationToken(userId: string): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      },
    });
    return raw;
  }

  private async createPasswordResetToken(userId: string): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    return raw;
  }

  private async sendVerificationEmail(
    to: string,
    displayName: string,
    locale: string,
    token: string,
  ): Promise<void> {
    const url = this.buildUrl('/verify-email', locale, token);
    await this.mail.send({
      to,
      subject: 'Verify your HabitFlow email',
      text: `Welcome to HabitFlow, ${displayName}!\n\nConfirm your email address to activate your account:\n${url}\n\nThis link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
    });
  }

  private async sendResetPasswordEmail(
    to: string,
    locale: string,
    token: string,
  ): Promise<void> {
    const url = this.buildUrl('/reset-password', locale, token);
    await this.mail.send({
      to,
      subject: 'Reset your HabitFlow password',
      text: `We received a request to reset your HabitFlow password.\n\nChoose a new password here:\n${url}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
    });
  }

  private buildUrl(path: string, locale: string, token: string): string {
    const base =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    const normalized = base.replace(/\/+$/, '');
    const safeLocale = locale === 'ar' ? 'ar' : 'en';
    return `${normalized}/${safeLocale}${path}?token=${encodeURIComponent(token)}`;
  }

  private async safeSend(
    send: () => Promise<void>,
    to: string,
    kind: string,
  ): Promise<void> {
    try {
      await send();
    } catch (error) {
      this.logger.warn(
        `Failed to send ${kind} to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async issueTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const secret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      { secret, expiresIn: '15m' },
    );

    const refreshToken = randomBytes(48).toString('hex');
    await prisma.session.create({
      data: {
        userId,
        refreshTokenHash: sha256(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      },
    });

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private sanitize(user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    locale: string;
    timezone: string;
    plan: string;
    status: string;
  }): Record<string, unknown> {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      locale: user.locale,
      timezone: user.timezone,
      plan: user.plan,
      status: user.status,
    };
  }
}
