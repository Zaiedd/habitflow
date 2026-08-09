import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateJournalDto {
  @ApiProperty({
    enum: ['DAILY', 'GRATITUDE', 'REFLECTION', 'FREE'],
    default: 'FREE',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  entryType?: 'DAILY' | 'GRATITUDE' | 'REFLECTION' | 'FREE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ example: 'Today I...' })
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  body!: string;

  @ApiPropertyOptional({ description: 'Mood scale 1-5' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  mood?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: 'PRIVATE' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  privacy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  entryDate?: string;
}
