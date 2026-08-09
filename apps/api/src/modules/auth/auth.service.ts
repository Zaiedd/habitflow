import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PlanCode, prisma } from '@habitflow/db';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import type { LoginDto } from './dto/login.dto';
import type { RefreshDto } from './dto/refresh.dto';
import type { RegisterDto } from './dto/register.dto';

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;

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
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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
        status: 'ACTIVE',
      },
    });

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
