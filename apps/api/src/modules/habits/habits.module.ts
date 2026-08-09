import { Module } from '@nestjs/common';
import { GamificationModule } from '../gamification/gamification.module';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';

@Module({
  imports: [GamificationModule],
  controllers: [HabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}
