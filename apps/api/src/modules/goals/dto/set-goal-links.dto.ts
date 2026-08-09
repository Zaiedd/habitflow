import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoalLinkDto {
  @ApiProperty({ enum: ['HABIT', 'TASK'] })
  @IsString()
  @Matches(/^(HABIT|TASK)$/)
  entityType!: 'HABIT' | 'TASK';

  @ApiProperty()
  @IsString()
  entityId!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class SetGoalLinksDto {
  @ApiProperty({ type: [GoalLinkDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => GoalLinkDto)
  links!: GoalLinkDto[];
}
