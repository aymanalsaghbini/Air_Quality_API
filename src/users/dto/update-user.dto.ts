import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../auth/role.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'newemail@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: Role.ADMIN, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
