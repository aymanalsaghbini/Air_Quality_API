import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User email' })
  @IsEmail() // Validate email format
  @IsNotEmpty() // Ensure the email is not empty
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString() // Ensure the password is a string
  @IsNotEmpty() // Ensure the password is not empty
  password: string;
}
