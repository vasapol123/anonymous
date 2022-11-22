import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signupLocal: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({
        jwtAccessToken: 'fakeJwtAccessToken',
        jwtRefreshToken: 'fakeJwtRefreshToken',
      });
    }),
    signinLocal: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({
        jwtAccessToken: 'fakeJwtAccessToken',
        jwtRefreshToken: 'fakeJwtRefreshToken',
      });
    }),
    logout: jest.fn().mockResolvedValue(true),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        TokensService,
        UsersService,
        JwtService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        ConfigService,
      ],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signupLocal', () => {
    it('should successfully sign up a user', async () => {
      const authDto: AuthDto = {
        email: 'example@test.com',
        password: '1234',
      };

      await expect(controller.signupLocal(authDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockAuthService.signupLocal).toHaveBeenCalledWith(authDto);
    });
  });

  describe('signinLocal', () => {
    it('should successfully sign in a user', async () => {
      const authDto: AuthDto = {
        email: 'example@test.com',
        password: '1234',
      };

      await expect(controller.signinLocal(authDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockAuthService.signinLocal).toHaveBeenCalledWith(authDto);
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      await expect(controller.logout(Date.now())).resolves.toEqual(true);
    });
  });
});
