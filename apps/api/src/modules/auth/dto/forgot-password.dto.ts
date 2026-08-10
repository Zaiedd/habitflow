import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'maya@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
