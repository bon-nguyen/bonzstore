import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'staff@bonzstore.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Staff@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Lê Nhân Viên' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: '0909888777' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Role ID hoặc Role Code (vd: STORE_MANAGER, STAFF)' })
  @IsString()
  @IsNotEmpty()
  roleIdOrCode: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'LOCKED'], default: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'LOCKED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

