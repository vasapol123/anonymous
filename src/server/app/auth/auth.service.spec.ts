import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const user: User = {
    id: Date.now(),
    createAt: new Date(),
    updateAt: new Date(),
    email: 'example@test.com',
    hashedPassword: '1234',
    hashedRefreshToken: 'fakeRefreshToken',
  };

  const mockTokensService = {
    getTokens: jest.fn().mockResolvedValue({
      jwtAccessToken: 'fakeJwtAccessToken',
      jwtRefreshToken: 'fakeJwtRefreshToken',
    }),
    updateRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    createUser: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({
        id: Date.now(),
        ...dto,
      });
    }),
    findUserByEmail: jest.fn().mockResolvedValue(user),
    updateUser: jest.fn().mockResolvedValue(user),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TokensService,
          useValue: mockTokensService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signupLocal', () => {
    it('should successfully sign up a user', async () => {
      const authDto: AuthDto = {
        email: 'example@test.com',
        password: '1234',
      };

      await expect(service.signupLocal(authDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('signinLocal', () => {
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

    const authDto: AuthDto = {
      email: user.email,
      password: '1234',
    };

    it('should successfully sign in a user', async () => {
      await expect(service.signinLocal(authDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });

    it('should throw a BadRequestException error if user does not exist', async () => {
      jest
        .spyOn(mockUsersService, 'findUserByEmail')
        .mockResolvedValueOnce(null);

      await expect(service.signinLocal(authDto)).rejects.toThrowError(
        new BadRequestException('User does not exist'),
      );
    });

    it('should throw a BadRequestException error if password invalid', async () => {
      await expect(
        service.signinLocal({ ...authDto, password: '4321' }),
      ).rejects.toThrowError(new BadRequestException('Password invalid'));
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      await expect(service.logout(Date.now())).resolves.toEqual(true);
    });
  });
});
