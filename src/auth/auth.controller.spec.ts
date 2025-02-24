import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn().mockResolvedValue({ accessToken: 'mocked-jwt-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return JWT token on successful login', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(result).toEqual({ accessToken: 'mocked-jwt-token' });
    });

    it('should throw an error on invalid credentials', async () => {
      jest.spyOn(authService, 'login').mockRejectedValueOnce(new Error('Invalid credentials'));

      const loginDto: LoginDto = { email: 'wrong@example.com', password: 'wrongpassword' };

      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });
});
