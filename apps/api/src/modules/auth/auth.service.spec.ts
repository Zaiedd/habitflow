import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PlanCode, prisma } from '@habitflow/db';
import bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

jest.mock('@habitflow/db', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
  PlanCode: { FREE: 'FREE', PRO: 'PRO' },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwt: { signAsync: jest.Mock };
  let mail: { send: jest.Mock };

  const mockedPrisma = prisma as unknown as {
    user: Record<string, jest.Mock>;
    session: Record<string, jest.Mock>;
    emailVerificationToken: Record<string, jest.Mock>;
    passwordResetToken: Record<string, jest.Mock>;
  };

  const registeredUser = {
    id: 'u1',
    email: 'sara@example.com',
    displayName: 'Sara Hassan',
    avatarUrl: null,
    locale: 'en',
    timezone: 'UTC',
    plan: 'FREE',
    status: 'PENDING_VERIFICATION',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) =>
              key === 'JWT_ACCESS_SECRET' ? 'test-secret' : 'test-secret-2',
            ),
            get: jest.fn(() => 'http://localhost:3000'),
          },
        },
        {
          provide: MailService,
          useValue: { send: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwt = module.get(JwtService) as unknown as {
      signAsync: jest.Mock;
    };
    mail = module.get(MailService) as unknown as { send: jest.Mock };
  });

  describe('register', () => {
    const dto: RegisterDto = {
      displayName: 'Sara Hassan',
      email: 'Sara@Example.com',
      password: 'Password123!',
      locale: 'en',
    };

    it('creates a PENDING_VERIFICATION user, mails a link and issues tokens', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(registeredUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockedPrisma.session.create.mockResolvedValue({ id: 's1' });
      mockedPrisma.emailVerificationToken.create.mockResolvedValue({
        id: 'evt1',
      });

      const result = await service.register(dto);

      expect(mockedPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'sara@example.com',
            passwordHash: 'hashed',
            status: 'PENDING_VERIFICATION',
            plan: PlanCode.FREE,
          }),
        }),
      );
      expect(mockedPrisma.emailVerificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            tokenHash: expect.any(String),
            expiresAt: expect.any(Date),
          }),
        }),
      );
      expect(mail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'sara@example.com',
          subject: expect.stringContaining('Verify'),
          text: expect.stringContaining('/en/verify-email?token='),
        }),
      );
      expect(result.tokens.accessToken).toBe('signed-token');
      expect(result.user).toEqual(
        expect.objectContaining({ email: 'sara@example.com' }),
      );
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('still registers when the verification email fails to send', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(registeredUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockedPrisma.session.create.mockResolvedValue({ id: 's1' });
      mockedPrisma.emailVerificationToken.create.mockResolvedValue({
        id: 'evt1',
      });
      mail.send.mockRejectedValueOnce(new Error('smtp down'));

      const result = await service.register(dto);

      expect(result.tokens.accessToken).toBe('signed-token');
      expect(mockedPrisma.user.create).toHaveBeenCalled();
    });

    it('throws a conflict error when the email is already taken', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(registeredUser);

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(mockedPrisma.user.create).not.toHaveBeenCalled();
    });

    it('normalizes the email to lowercase before persisting', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(registeredUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await service.register(dto);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'sara@example.com' },
      });
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'sara@example.com',
      password: 'Password123!',
    };

    it('returns tokens for valid credentials', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        ...registeredUser,
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockedPrisma.session.create.mockResolvedValue({ id: 's1' });

      const result = await service.login(dto);

      expect(result.tokens.accessToken).toBe('signed-token');
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
        }),
      );
    });

    it('rejects a wrong password', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        ...registeredUser,
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an unknown email or a user without a password hash', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        ...registeredUser,
        passwordHash: null,
      });

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('rotates the refresh token for a valid session', async () => {
      mockedPrisma.session.findUnique.mockResolvedValue({
        id: 's1',
        userId: 'u1',
        user: { email: 'sara@example.com' },
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      mockedPrisma.session.update.mockResolvedValue({ id: 's1' });

      const result = await service.refresh({ refreshToken: 'valid-token' });

      expect(mockedPrisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
      expect(result.tokens.accessToken).toBe('signed-token');
    });

    it('rejects a revoked or expired session', async () => {
      mockedPrisma.session.findUnique.mockResolvedValue({
        id: 's1',
        userId: 'u1',
        user: { email: 'sara@example.com' },
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(
        service.refresh({ refreshToken: 'revoked-token' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an unknown refresh token', async () => {
      mockedPrisma.session.findUnique.mockResolvedValue(null);

      await expect(
        service.refresh({ refreshToken: 'unknown-token' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revokes matching sessions', async () => {
      mockedPrisma.session.updateMany.mockResolvedValue({ count: 1 });

      await service.logout('refresh-token');

      expect(mockedPrisma.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('me', () => {
    it('returns the sanitized user for a known id', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(registeredUser);

      const result = await service.me('u1');

      expect(result).toEqual(expect.objectContaining({ id: 'u1' }));
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws when the user does not exist', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.me('missing')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('activates the user and marks the token used', async () => {
      mockedPrisma.emailVerificationToken.findUnique.mockResolvedValue({
        id: 'evt1',
        userId: 'u1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: { status: 'PENDING_VERIFICATION' },
      });

      const result = await service.verifyEmail({ token: 'valid-token' });

      expect(result).toEqual({ verified: true });
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
      expect(mockedPrisma.emailVerificationToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'evt1' },
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      );
    });

    it('rejects an expired or already-used token', async () => {
      mockedPrisma.emailVerificationToken.findUnique.mockResolvedValue({
        id: 'evt1',
        userId: 'u1',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        user: { status: 'ACTIVE' },
      });

      await expect(
        service.verifyEmail({ token: 'used-token' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an unknown token', async () => {
      mockedPrisma.emailVerificationToken.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyEmail({ token: 'unknown-token' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('resendVerificationEmail', () => {
    it('creates a new token and mails it for a pending user', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        ...registeredUser,
        passwordHash: 'hashed',
      });
      mockedPrisma.emailVerificationToken.create.mockResolvedValue({
        id: 'evt2',
      });

      const result = await service.resendVerificationEmail({
        email: 'sara@example.com',
      });

      expect(result).toEqual({ sent: true });
      expect(mockedPrisma.emailVerificationToken.create).toHaveBeenCalled();
      expect(mail.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'sara@example.com' }),
      );
    });

    it('does not leak the account when the email is unknown', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.resendVerificationEmail({
        email: 'nobody@example.com',
      });

      expect(result).toEqual({ sent: true });
      expect(mockedPrisma.emailVerificationToken.create).not.toHaveBeenCalled();
      expect(mail.send).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('creates a reset token and mails a link for an existing user', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        ...registeredUser,
        passwordHash: 'hashed',
      });
      mockedPrisma.passwordResetToken.create.mockResolvedValue({ id: 'prt1' });

      const result = await service.forgotPassword({
        email: 'sara@example.com',
      });

      expect(result).toEqual({ sent: true });
      expect(mockedPrisma.passwordResetToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            tokenHash: expect.any(String),
          }),
        }),
      );
      expect(mail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'sara@example.com',
          subject: expect.stringContaining('Reset'),
          text: expect.stringContaining('/en/reset-password?token='),
        }),
      );
    });

    it('returns sent even for an unknown email (no account leak)', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nobody@example.com',
      });

      expect(result).toEqual({ sent: true });
      expect(mockedPrisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(mail.send).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('updates the password, marks the token used and revokes sessions', async () => {
      mockedPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt1',
        userId: 'u1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: { passwordHash: 'old-hash' },
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.resetPassword({
        token: 'valid-token',
        password: 'NewPassword123!',
      });

      expect(result).toEqual({ ok: true });
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({ passwordHash: 'new-hash' }),
        }),
      );
      expect(mockedPrisma.passwordResetToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      );
      expect(mockedPrisma.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'u1' }),
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });

    it('rejects an invalid or expired reset token', async () => {
      mockedPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'bad-token', password: 'NewPass123!' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('token issuance', () => {
    it('signs the access token with the configured secret', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(registeredUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockedPrisma.session.create.mockResolvedValue({ id: 's1' });

      await service.register({
        displayName: 'Sara Hassan',
        email: 'sara@example.com',
        password: 'Password123!',
      });

      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 'u1', email: 'sara@example.com' },
        { secret: 'test-secret', expiresIn: '15m' },
      );
      expect(mockedPrisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});
