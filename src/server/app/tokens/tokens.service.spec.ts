import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../../prisma/prisma.service';
import { TokensService } from './tokens.service';
import { User } from '@prisma/client';

describe('TokensService', () => {
  let service: TokensService;

  const user: User = {
    id: Date.now(),
    createAt: new Date(),
    updateAt: new Date(),
    email: 'example@test.com',
    hashedPassword: '1234',
    hashedRefreshToken: 'fakeRefreshToken',
  };

  const mockPrismaService = {
    user: {
      update: jest.fn().mockImplementation(() => null),
      findUnique: jest.fn().mockResolvedValue(user),
    },
  };

  beforeAll(async () => {
    jest
      .spyOn(argon2, 'verify')
      .mockImplementation(
        (
          hashedRefreshToken: string,
          refreshToken: string,
        ): Promise<boolean> => {
          return Promise.resolve(hashedRefreshToken === refreshToken);
        },
      );
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        ConfigService,
        JwtService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokens', () => {
    it('should create tokens and return those', () => {
      expect(service.getTokens(Date.now(), user.email)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('should call the update method', async () => {
      await service.updateRefreshToken(Date.now(), 'fakeRefreshToken');
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should successfully retotate refresh token', () => {
      expect(
        service.rotateRefreshTokens(Date.now(), 'fakeRefreshToken'),
      ).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when fail verifying refresh token', () => {
      expect(
        service.rotateRefreshTokens(Date.now(), 'wrongRefreshToken'),
      ).rejects.toThrowError(ForbiddenException);
    });
  });
});
