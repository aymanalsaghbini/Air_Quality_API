import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, email: user.email, role: user.role };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return {
      access_token: this.jwtService.sign({ sub: user.id, role: user.role }),
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token); // Verify and decode the token
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
