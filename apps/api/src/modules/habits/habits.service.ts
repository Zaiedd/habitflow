import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventType, Prisma, prisma } from '@habitflow/db';
import { GamificationService } from '../gamification/gamification.service';
import type { CompleteHabitDto } from './dto/complete-habit.dto';
import type { CreateHabitDto } from './dto/create-habit.dto';
import type { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private readonly gamification: GamificationService) {}
  async create(userId: string, dto: CreateHabitDto) {
    if (dto.categoryId) {
      await this.assertCategoryOwnership(userId, dto.categoryId);
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        icon: dto.icon,
        color: dto.color,
        type: dto.type ?? 'POSITIVE',
        difficulty: dto.difficulty ?? 'MEDIUM',
        targetQty: dto.targetQty ?? 1,
        targetPeriod: dto.targetPeriod ?? 'DAY',
        intervalDays: dto.intervalDays,
        scheduleDays: dto.scheduleDays ?? [],
        remindAtMin: dto.remindAtMin,
        reminderEnabled: dto.reminderEnabled ?? false,
        streakFreezeEnabled: dto.streakFreezeEnabled ?? true,
      },
    });

    await prisma.habitStreak.upsert({
      where: { habitId: habit.id },
      create: { userId, habitId: habit.id },
      update: {},
    });

    return this.findOne(userId, habit.id);
  }

  async findAll(userId: string, includeArchived = false) {
    return prisma.habit.findMany({
      where: {
        userId,
        archivedAt: includeArchived ? undefined : null,
      },
      orderBy: [{ archivedAt: 'asc' }, { createdAt: 'asc' }],
      include: { category: true, streak: true },
    });
  }

  async findOne(userId: string, id: string) {
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
      include: { category: true, streak: true },
    });
    if (!habit) {
      throw new NotFoundException('HABIT_NOT_FOUND');
    }
    return habit;
  }

  async update(userId: string, id: string, dto: UpdateHabitDto) {
    await this.findOne(userId, id);
    if (dto.categoryId) {
      await this.assertCategoryOwnership(userId, dto.categoryId);
    }
    return prisma.habit.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        icon: dto.icon,
        color: dto.color,
        type: dto.type,
        difficulty: dto.difficulty,
        targetQty: dto.targetQty,
        targetPeriod: dto.targetPeriod,
        intervalDays: dto.intervalDays,
        scheduleDays: dto.scheduleDays,
        remindAtMin: dto.remindAtMin,
        reminderEnabled: dto.reminderEnabled,
        streakFreezeEnabled: dto.streakFreezeEnabled,
      },
      include: { category: true, streak: true },
    });
  }

  async archive(userId: string, id: string, archived: boolean) {
    await this.findOne(userId, id);
    return prisma.habit.update({
      where: { id },
      data: { archivedAt: archived ? new Date() : null },
      include: { category: true, streak: true },
    });
  }

  async complete(userId: string, habitId: string, dto: CompleteHabitDto) {
    const habit = await this.findOne(userId, habitId);

    const existing = await prisma.habitCompletion.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      return { completion: existing, idempotent: true };
    }

    const occurredAt = new Date(dto.occurredAt);
    const result = await prisma.$transaction(async (tx) => {
      const completion = await tx.habitCompletion.create({
        data: {
          userId,
          habitId,
          localId: dto.localId,
          occurredAt,
          qty: dto.qty ?? 1,
          note: dto.note,
          idempotencyKey: dto.idempotencyKey,
        },
      });

      const streak = await this.bumpStreak(tx, userId, habitId, occurredAt);

      await tx.event.create({
        data: {
          userId,
          type: EventType.HABIT_COMPLETED,
          entityType: 'HABIT',
          entityId: habitId,
          occurredAt,
          payload: { qty: dto.qty ?? 1 },
          idempotencyKey: `event:${dto.idempotencyKey}`,
        },
      });

      return { completion, streak };
    });

    const gamification = await this.gamification.onHabitCompleted(
      userId,
      { id: habitId, difficulty: habit.difficulty },
      result.completion.id,
    );

    return { ...result, gamification, idempotent: false };
  }

  async stats(userId: string, id: string) {
    const habit = await this.findOne(userId, id);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const completionsLast30Days = await prisma.habitCompletion.count({
      where: { habitId: id, occurredAt: { gte: since } },
    });
    return {
      habitId: id,
      currentStreak: habit.streak?.currentStreak ?? 0,
      longestStreak: habit.streak?.longestStreak ?? 0,
      lastCompletedOn: habit.streak?.lastCompletedOn ?? null,
      completionsLast30Days,
    };
  }

  private async bumpStreak(
    tx: Prisma.TransactionClient,
    userId: string,
    habitId: string,
    occurredAt: Date,
  ) {
    const current = await tx.habitStreak.findUnique({ where: { habitId } });
    const today = occurredAt.toISOString().slice(0, 10);
    const last = current?.lastCompletedOn
      ? new Date(current.lastCompletedOn).toISOString().slice(0, 10)
      : null;

    if (last === today) {
      return current;
    }

    const next = (current?.currentStreak ?? 0) + 1;
    const longest = Math.max(current?.longestStreak ?? 0, next);

    return tx.habitStreak.upsert({
      where: { habitId },
      create: {
        userId,
        habitId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedOn: occurredAt,
      },
      update: {
        currentStreak: next,
        longestStreak: longest,
        lastCompletedOn: occurredAt,
      },
    });
  }

  private async assertCategoryOwnership(userId: string, categoryId: string) {
    const category = await prisma.habitCategory.findFirst({
      where: { id: categoryId, userId },
    });
    if (!category) {
      throw new ForbiddenException('CATEGORY_NOT_FOUND');
    }
  }
}
