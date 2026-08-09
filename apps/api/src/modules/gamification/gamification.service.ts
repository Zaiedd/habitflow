import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventType, prisma } from '@habitflow/db';

interface BadgeDefinition {
  code: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
}

const BADGE_CATALOG: BadgeDefinition[] = [
  {
    code: 'first_habit',
    title: 'First Step',
    description: 'Complete your first habit',
    icon: 'sprout',
    rarity: 'COMMON',
  },
  {
    code: 'streak_3',
    title: 'On a Roll',
    description: 'Reach a 3-day streak',
    icon: 'flame',
    rarity: 'COMMON',
  },
  {
    code: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Reach a 7-day streak',
    icon: 'zap',
    rarity: 'RARE',
  },
  {
    code: 'streak_30',
    title: 'Unstoppable',
    description: 'Reach a 30-day streak',
    icon: 'rocket',
    rarity: 'EPIC',
  },
  {
    code: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: 'star',
    rarity: 'RARE',
  },
  {
    code: 'level_10',
    title: 'Momentum',
    description: 'Reach level 10',
    icon: 'sparkles',
    rarity: 'EPIC',
  },
  {
    code: 'habit_5',
    title: 'Variety',
    description: 'Create 5 habits',
    icon: 'target',
    rarity: 'COMMON',
  },
];

const DIFFICULTY_XP: Record<string, number> = {
  EASY: 10,
  MEDIUM: 20,
  HARD: 30,
};
const STREAK_BONUS_CAP = 10;

function levelFromXp(totalXp: number): number {
  let level = 1;
  while (50 * (level + 1) * level <= totalXp) {
    level += 1;
  }
  return level;
}

function xpToNext(totalXp: number, level: number): number {
  return 50 * (level + 1) * level - totalXp;
}

@Injectable()
export class GamificationService implements OnModuleInit {
  private readonly logger = new Logger(GamificationService.name);

  async onModuleInit() {
    try {
      for (const badge of BADGE_CATALOG) {
        await prisma.badge.upsert({
          where: { code: badge.code },
          create: badge,
          update: badge,
        });
      }
    } catch (error) {
      this.logger.warn(
        `Badge catalog not seeded (DB unavailable): ${(error as Error).message}`,
      );
    }
  }

  async onHabitCompleted(
    userId: string,
    habit: { id: string; difficulty: string },
    sourceId: string,
  ) {
    const streak = await prisma.habitStreak.findUnique({
      where: { habitId: habit.id },
    });
    const currentStreak = streak?.currentStreak ?? 1;

    const difficultyXp = DIFFICULTY_XP[habit.difficulty] ?? 20;
    const streakBonus = Math.min(currentStreak, STREAK_BONUS_CAP) * 5;
    const xpGained = difficultyXp + streakBonus;

    const before = await prisma.userLevel.upsert({
      where: { userId },
      create: { userId, level: 1, xp: 0, totalXp: 0 },
      update: {},
    });

    const totalXp = before.totalXp + xpGained;
    const level = levelFromXp(totalXp);
    const leveledUp = level > before.level;
    const nextXp = xpToNext(totalXp, level);

    await prisma.userLevel.update({
      where: { userId },
      data: { totalXp, xp: xpGained, level },
    });

    await prisma.event.create({
      data: {
        userId,
        type: EventType.XP_EARNED,
        entityType: 'HABIT',
        entityId: habit.id,
        occurredAt: new Date(),
        payload: { xp: xpGained, difficultyXp, streakBonus, level },
        idempotencyKey: `xp:${sourceId}`,
      },
    });

    const badges = await this.evaluateBadges(userId, { currentStreak, level });

    return {
      xpGained,
      totalXp,
      level,
      leveledUp,
      xpToNext: nextXp,
      badges,
    };
  }

  async me(userId: string) {
    const level = await prisma.userLevel.findUnique({ where: { userId } });
    const awards = await prisma.badgeAward.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
      include: { badge: true },
    });

    const totalXp = level?.totalXp ?? 0;
    const currentLevel = level?.level ?? 1;

    return {
      level: currentLevel,
      totalXp,
      xpToNext: xpToNext(totalXp, currentLevel),
      badges: awards.map((a) => a.badge),
    };
  }

  async listBadges() {
    return prisma.badge.findMany({ orderBy: { createdAt: 'asc' } });
  }

  private async evaluateBadges(
    userId: string,
    ctx: { currentStreak: number; level: number },
  ): Promise<{ code: string }[]> {
    const [habitCount, completionCount] = await Promise.all([
      prisma.habit.count({ where: { userId } }),
      prisma.habitCompletion.count({ where: { userId } }),
    ]);

    const candidates: string[] = [];
    if (completionCount >= 1) candidates.push('first_habit');
    if (ctx.currentStreak >= 3) candidates.push('streak_3');
    if (ctx.currentStreak >= 7) candidates.push('streak_7');
    if (ctx.currentStreak >= 30) candidates.push('streak_30');
    if (ctx.level >= 5) candidates.push('level_5');
    if (ctx.level >= 10) candidates.push('level_10');
    if (habitCount >= 5) candidates.push('habit_5');

    const earned: { code: string }[] = [];
    for (const code of candidates) {
      try {
        await prisma.badgeAward.create({
          data: {
            userId,
            badgeId: (await prisma.badge.findUniqueOrThrow({ where: { code } }))
              .id,
          },
        });
        await prisma.event.create({
          data: {
            userId,
            type: EventType.BADGE_UNLOCKED,
            entityType: 'BADGE',
            entityId: code,
            occurredAt: new Date(),
            payload: { badge: code },
            idempotencyKey: `badge:${userId}:${code}`,
          },
        });
        earned.push({ code });
      } catch {
        // already earned
      }
    }
    return earned;
  }
}
