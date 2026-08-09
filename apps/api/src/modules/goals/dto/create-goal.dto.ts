import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@habitflow/db';
import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'Run a half marathon' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'FITNESS' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  goalType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'distance_km' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  targetMetric?: string;

  @ApiPropertyOptional({ example: 21.1 })
  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @ApiPropertyOptional({ description: 'SMART goal annotations' })
  @IsOptional()
  @IsObject()
  smart?: Prisma.InputJsonValue;
}
