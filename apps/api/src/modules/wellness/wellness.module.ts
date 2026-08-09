import { Module } from '@nestjs/common';
import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';

@Module({
  controllers: [WellnessController],
  providers: [WellnessService],
})
export class WellnessModule {}
