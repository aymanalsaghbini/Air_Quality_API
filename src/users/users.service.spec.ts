import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { HttpException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
      };

      // Mocking Prisma and bcrypt
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null); // Ensure no user exists

      // Mock bcrypt.hash with the correct type
      const bcryptHashMock = jest.spyOn(bcrypt, 'hash') as jest.MockedFunction<
        typeof bcrypt.hash
      > as any;
      bcryptHashMock.mockResolvedValue('hashedPassword'); // Now we know it resolves to a string

      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: '1',
        ...dto,
        password: 'hashedPassword',
      });

      const result = await service.createUser(dto);
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcryptHashMock).toHaveBeenCalledWith(dto.password, 10); // Check if bcrypt.hash was called correctly
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: dto.email, password: 'hashedPassword', role: dto.role },
      });
    });

    it('should throw an error if email already exists', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
      };

      // Simulate an existing user
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: '1',
        email: dto.email,
        password: 'existingHashedPassword',
        role: dto.role,
      });

      await expect(service.createUser(dto)).rejects.toThrow(HttpException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(prisma.user, 'delete').mockResolvedValue({ id: '1' } as any);

      const result = await service.deleteUser('1');
      expect(result).toEqual({ id: '1' });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw an error if delete fails', async () => {
      jest.spyOn(prisma.user, 'delete').mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteUser('1')).rejects.toThrow(HttpException);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: '1', email: 'test@example.com', role: 'USER' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);

      const result = await service.findUserByEmail('test@example.com');
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw an error if fetch fails', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockRejectedValue(new Error('Fetch failed'));

      await expect(service.findUserByEmail('test@example.com')).rejects.toThrow(HttpException);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const dto = { email: 'new@example.com', role: 'ADMIN' };
      const user = { id: '1', email: 'old@example.com', role: 'USER' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({ id: '1', ...dto } as any);

      const result = await service.updateUser('1', dto as any);
      expect(result).toEqual({
        id: '1',
        email: 'new@example.com',
        role: 'ADMIN',
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { email: 'new@example.com', role: 'ADMIN' },
      });
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.updateUser('1', { email: 'test@example.com' })).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: '1', email: 'test@example.com', role: 'USER' }];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(users as any);

      const result = await service.getAllUsers();
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });
});
