import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    createUser: jest.fn((dto) => {
      return {
        id: Date.now(),
        ...dto,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'example@test.com',
        hashedPassword: 'fakeHashedPassword',
      };

      expect(await controller.createUser(createUserDto)).toEqual({
        id: expect.any(Number),
        ...createUserDto,
      });

      expect(mockUsersService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});
