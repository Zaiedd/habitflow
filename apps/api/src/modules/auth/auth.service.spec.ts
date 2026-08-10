import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PlanCode, prisma } from '@habitflow/db';
import bcrypt from 'bcryptjs';
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

  const mockedPrisma = prisma as unknown as {
    user: Record<string, jest.Mock>;
    session: Record<string, jest.Mock>;
  };

  const registeredUser = {
    id: 'u1',
    email: 'sara@example.com',
    displayName: 'Sara Hassan',
    avatarUrl: null,
    locale: 'en',
    timezone: 'UTC',
    plan: 'FREE',
    status: 'ACTIVE',
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
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwt = module.get(JwtService) as unknown as {
      signAsync: jest.Mock;
    };
  });

  describe('register', () => {
    const dto: RegisterDto = {
      displayName: 'Sara Hassan',
      email: 'Sara@Example.com',
      password: 'Password123!',
      locale: 'en',
    };

    it('creates an ACTIVE free-plan user and issues tokens', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(registeredUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockedPrisma.session.create.mockResolvedValue({ id: 's1' });

      const result = await service.register(dto);

      expect(mockedPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'sara@example.com',
            passwordHash: 'hashed',
            status: 'ACTIVE',
            plan: PlanCode.FREE,
          }),
        }),
      );
      expect(result.tokens.accessToken).toBe('signed-token');
      expect(result.user).toEqual(
        expect.objectContaining({ email: 'sara@example.com' }),
      );
      expect(result.user).not.toHaveProperty('passwordHash');
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
