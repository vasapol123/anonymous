import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import jwtDecode from 'jwt-decode';

import { JwtPayload } from 'src/server/common/interface/jwt-payload.interface';
import { Tokens } from 'src/server/app/tokens/interface/tokens.interface';
import { TokensService } from 'src/server/app/tokens/tokens.service';
import { UsersService } from 'src/server/app/users/users.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AuthService } from '../../auth.service';
import { AuthDto } from '../../dto/auth.dto';

describe('Auth Flow', () => {
  let prisma: PrismaService;
  let service: AuthService;

  const authDto: AuthDto = {
    email: 'example@test.com',
    password: '123456',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        UsersService,
        TokensService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('signup', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should signup', async () => {
      const tokens = await service.signupLocal(authDto);

      expect(tokens.jwtAccessToken).toBeTruthy();
      expect(tokens.jwtRefreshToken).toBeTruthy();
    });

    it('should throw on duplicate user signup', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.signupLocal(authDto);
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('signin', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should throw if user does not exist', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.signinLocal(authDto);
      } catch (e) {
        expect(e.status).toBe(400);
      }

      expect(tokens).toBeUndefined();
    });

    it('should login a user', async () => {
      await service.signupLocal(authDto);

      const tokens = await service.signinLocal(authDto);

      expect(tokens.jwtAccessToken).toBeTruthy();
      expect(tokens.jwtRefreshToken).toBeTruthy();
    });

    it('should throw if password incorrect', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.signinLocal({
          email: authDto.email,
          password: authDto.password.slice(0, -1),
        });
      } catch (e) {
        expect(e.status).toBe(400);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('logout', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should pass if logout for non existing user', async () => {
      try {
        await service.logout(5);
      } catch (e) {
        expect(e.status).toBe(403);
      }
    });
  });

  it('should logout a user', async () => {
    await service.signupLocal(authDto);

    let userFromDb: User | null;

    userFromDb = await prisma.user.findFirst({
      where: {
        email: authDto.email,
      },
    });
    expect(userFromDb?.hashedRefreshToken).toBeTruthy();

    await service.logout(userFromDb.id);

    userFromDb = await prisma.user.findFirst({
      where: {
        email: authDto.email,
      },
    });
    expect(userFromDb?.hashedRefreshToken).toBeFalsy();
  });

  describe('rotate refresh token', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should throw if user does not exist', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.rotateRefreshTokens(1, '');
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if user logged out', async () => {
      const _tokens = await service.signupLocal(authDto);
      const refreshToken = _tokens.jwtRefreshToken;

      const decoded = jwtDecode<JwtPayload>(refreshToken);
      const userId = Number(decoded?.sub);

      await service.logout(userId);

      let tokens: Tokens | undefined;
      try {
        tokens = await service.rotateRefreshTokens(userId, refreshToken);
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if refresh token incorrect', async () => {
      await prisma.cleanDatabase();

      const _tokens = await service.signupLocal(authDto);
      const refreshToken = _tokens.jwtRefreshToken;

      const decoded = jwtDecode<JwtPayload>(refreshToken);
      const userId = Number(decoded?.sub);

      let tokens: Tokens | undefined;
      try {
        tokens = await service.rotateRefreshTokens(
          userId,
          refreshToken.slice(0, -1),
        );
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  it('should rotate refresh token', async () => {
    await prisma.cleanDatabase();

    const _tokens = await service.signupLocal(authDto);
    const refreshToken = _tokens.jwtRefreshToken;
    const accessToken = _tokens.jwtAccessToken;

    const decoded = jwtDecode<JwtPayload>(refreshToken);
    const userId = Number(decoded?.sub);

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });

    const tokens = await service.rotateRefreshTokens(userId, refreshToken);
    expect(tokens).toBeDefined();

    expect(tokens.jwtAccessToken).not.toBe(accessToken);
    expect(tokens.jwtRefreshToken).not.toBe(refreshToken);
  });
});
