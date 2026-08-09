import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateHabitDto {
  @ApiProperty({ example: 'Drink water' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ enum: ['POSITIVE', 'NEGATIVE'], default: 'POSITIVE' })
  @IsEnum(['POSITIVE', 'NEGATIVE'])
  type?: 'POSITIVE' | 'NEGATIVE';

  @ApiProperty({ enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' })
  @IsEnum(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  @Max(1000)
  targetQty?: number;

  @ApiProperty({ enum: ['DAY', 'WEEK', 'MONTH', 'INTERVAL'], default: 'DAY' })
  @IsEnum(['DAY', 'WEEK', 'MONTH', 'INTERVAL'])
  targetPeriod?: 'DAY' | 'WEEK' | 'MONTH' | 'INTERVAL';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  intervalDays?: number;

  @ApiPropertyOptional({
    type: [Number],
    description: '0 = Sunday ... 6 = Saturday',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  scheduleDays?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  remindAtMin?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  streakFreezeEnabled?: boolean;
}
