import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn().mockImplementation(
        user => Promise.resolve({ id: Date.now(), ...(user.data) })
      )
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user record and return that', async () => {
      const createUserDto: CreateUserDto = {
        email: 'example@test.com',
        password: '1234'
      }
  
      expect(await service.createUser(createUserDto))
        .toEqual({
          id: expect.any(Number),
          email: createUserDto.email,
          hashedPassword: expect.not.stringMatching(
            new RegExp(`^${createUserDto.password}$`, 'g'
            )),
        })
    });
  });
});
