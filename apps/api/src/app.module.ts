import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EventsModule } from './modules/events/events.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { GoalsModule } from './modules/goals/goals.module';
import { HabitsModule } from './modules/habits/habits.module';
import { HealthModule } from './modules/health/health.module';
import { JournalModule } from './modules/journal/journal.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WellnessModule } from './modules/wellness/wellness.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AuthModule,
    BillingModule,
    CategoriesModule,
    HabitsModule,
    GoalsModule,
    TasksModule,
    WellnessModule,
    JournalModule,
    GamificationModule,
    EventsModule,
  ],
})
export class AppModule {}
