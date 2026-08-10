import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3…' })
  @IsString()
  @MinLength(10)
  token!: string;

  @ApiProperty({ example: 'n3w-s3cure-Pass!42' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
