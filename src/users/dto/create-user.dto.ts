import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User email' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, { message: 'Password should be between 6 and 20 characters' })
  password: string;

  @ApiProperty({
    example: 'ADMIN',
    enum: ['ADMIN', 'USER'],
    description: 'User role',
  })
  @IsEnum({ ADMIN: 'ADMIN', USER: 'USER' })
  role: 'ADMIN' | 'USER';
}
