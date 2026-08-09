import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'maya@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 's3cure-Pass!42' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Maya' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  displayName!: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
