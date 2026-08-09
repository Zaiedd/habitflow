import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'maya@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 's3cure-Pass!42' })
  @IsString()
  password!: string;
}
