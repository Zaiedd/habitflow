import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ example: '6d1f...' })
  @IsString()
  @MinLength(16)
  refreshToken!: string;
}
