import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CompleteHabitDto {
  @ApiProperty({ description: 'Client-generated UUID for offline dedup' })
  @IsUUID()
  localId!: string;

  @ApiProperty({ description: 'ISO-8601 UTC timestamp of completion' })
  @IsDateString()
  occurredAt!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  qty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ description: 'Idempotency key to make retries safe' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey!: string;
}
