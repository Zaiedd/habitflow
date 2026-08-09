import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@habitflow/db';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class LogWellnessDto {
  @ApiProperty({ example: 7.5 })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional({ example: 'hr' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Metric-specific extras (e.g. mood tags, exercise type)',
  })
  @IsOptional()
  @IsObject()
  extra?: Prisma.InputJsonValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiPropertyOptional({ default: 'APP' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  source?: string;

  @ApiPropertyOptional({
    description: 'External provider identifier for dedup',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  externalId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  tzOffsetMin?: number;
}
