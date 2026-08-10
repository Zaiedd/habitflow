import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckoutDto {
  @ApiPropertyOptional({ enum: ['pro', 'family'], example: 'pro' })
  @IsIn(['pro', 'family'])
  plan!: 'pro' | 'family';

  @ApiPropertyOptional({ enum: ['month', 'year'], example: 'year' })
  @IsIn(['month', 'year'])
  interval!: 'month' | 'year';

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
