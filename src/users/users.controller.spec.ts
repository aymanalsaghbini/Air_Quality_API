import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    createUser: jest.fn().mockImplementation((dto) => ({
      id: '1',
      ...dto,
    })),
    deleteUser: jest.fn().mockResolvedValue({ message: 'User deleted' }),
    getAllUsers: jest
      .fn()
      .mockResolvedValue([{ id: '1', email: 'test@example.com', role: 'USER' }]),
    updateUser: jest.fn().mockImplementation((id, dto) => ({
      id,
      ...dto,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: '12345',
        role: 'ADMIN',
      };
      const result = await controller.createUser(dto);
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        password: '12345',
        role: 'ADMIN',
      });
      expect(usersService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = await controller.deleteUser('1');
      expect(result).toEqual({ message: 'User deleted' });
      expect(usersService.deleteUser).toHaveBeenCalledWith('1');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const result = await controller.getAllUsers();
      expect(result).toEqual([{ id: '1', email: 'test@example.com', role: 'USER' }]);
      expect(usersService.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = {
        email: 'new@example.com',
        role: 'ADMIN',
      } as any;
      const result = await controller.updateUser('1', dto);
      expect(result).toEqual({
        id: '1',
        email: 'new@example.com',
        role: 'ADMIN',
      });
      expect(usersService.updateUser).toHaveBeenCalledWith('1', dto);
    });
  });
});
