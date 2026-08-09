import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalStatus, prisma } from '@habitflow/db';
import type { CreateGoalDto } from './dto/create-goal.dto';
import type { CreateMilestoneDto } from './dto/create-milestone.dto';
import type { SetGoalLinksDto } from './dto/set-goal-links.dto';
import type { UpdateGoalDto } from './dto/update-goal.dto';
import type { UpdateMilestoneDto } from './dto/update-milestone.dto';

@Injectable()
export class GoalsService {
  async create(userId: string, dto: CreateGoalDto) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        goalType: dto.goalType,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        targetMetric: dto.targetMetric,
        targetValue: dto.targetValue,
        smart: dto.smart,
      },
    });
    return this.findOne(userId, goal.id);
  }

  async findAll(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId, archivedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { milestones: { orderBy: { order: 'asc' } }, goalLinks: true },
    });
    return goals;
  }

  async findOne(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
      include: { milestones: { orderBy: { order: 'asc' } }, goalLinks: true },
    });
    if (!goal) {
      throw new NotFoundException('GOAL_NOT_FOUND');
    }
    return goal;
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    await this.findOne(userId, id);
    return prisma.goal.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        goalType: dto.goalType,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        targetMetric: dto.targetMetric,
        targetValue: dto.targetValue,
        smart: dto.smart,
      },
      include: { milestones: { orderBy: { order: 'asc' } }, goalLinks: true },
    });
  }

  async archive(userId: string, id: string, archived: boolean) {
    await this.findOne(userId, id);
    return prisma.goal.update({
      where: { id },
      data: {
        archivedAt: archived ? new Date() : null,
        status: GoalStatus.ARCHIVED,
      },
    });
  }

  async addMilestone(userId: string, goalId: string, dto: CreateMilestoneDto) {
    await this.findOne(userId, goalId);
    return prisma.goalMilestone.create({
      data: {
        goalId,
        title: dto.title,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        weight: dto.weight ?? 1,
        isCompleted: dto.isCompleted ?? false,
        order: dto.order ?? 0,
      },
    });
  }

  async updateMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
  ) {
    await this.findOne(userId, goalId);
    const milestone = await prisma.goalMilestone.findFirst({
      where: { id: milestoneId, goalId },
    });
    if (!milestone) {
      throw new NotFoundException('MILESTONE_NOT_FOUND');
    }
    return prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: {
        title: dto.title,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        weight: dto.weight,
        isCompleted: dto.isCompleted,
        completedAt: dto.isCompleted ? new Date() : null,
        order: dto.order,
      },
    });
  }

  async setLinks(userId: string, goalId: string, dto: SetGoalLinksDto) {
    await this.findOne(userId, goalId);

    const habitIds = dto.links
      .filter((l) => l.entityType === 'HABIT')
      .map((l) => l.entityId);
    const taskIds = dto.links
      .filter((l) => l.entityType === 'TASK')
      .map((l) => l.entityId);

    if (habitIds.length) {
      const count = await prisma.habit.count({
        where: { id: { in: habitIds }, userId },
      });
      if (count !== habitIds.length) {
        throw new BadRequestException('LINKED_HABIT_NOT_FOUND');
      }
    }
    if (taskIds.length) {
      const count = await prisma.task.count({
        where: { id: { in: taskIds }, userId },
      });
      if (count !== taskIds.length) {
        throw new BadRequestException('LINKED_TASK_NOT_FOUND');
      }
    }

    await prisma.$transaction([
      prisma.goalLink.deleteMany({ where: { goalId } }),
      ...dto.links.map((link) =>
        prisma.goalLink.create({
          data: {
            goalId,
            habitId: link.entityType === 'HABIT' ? link.entityId : null,
            taskId: link.entityType === 'TASK' ? link.entityId : null,
            weight: link.weight ?? 1,
          },
        }),
      ),
    ]);

    return this.findOne(userId, goalId);
  }

  async progress(userId: string, id: string) {
    const goal = await this.findOne(userId, id);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const milestones = await prisma.goalMilestone.findMany({
      where: { goalId: id },
    });
    const links = await prisma.goalLink.findMany({ where: { goalId: id } });

    const milestoneWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
    let milestoneScore: number | null = null;
    if (milestoneWeight > 0) {
      const doneWeight = milestones
        .filter((m) => m.isCompleted)
        .reduce((sum, m) => sum + m.weight, 0);
      milestoneScore = doneWeight / milestoneWeight;
    }

    const habitLinks = links.filter((l) => l.habitId);
    let habitScore: number | null = null;
    if (habitLinks.length) {
      let total = 0;
      for (const link of habitLinks) {
        const completions = await prisma.habitCompletion.count({
          where: { habitId: link.habitId!, occurredAt: { gte: since } },
        });
        total += Math.min(completions / 30, 1);
      }
      habitScore = total / habitLinks.length;
    }

    const taskLinks = links.filter((l) => l.taskId);
    let taskScore: number | null = null;
    if (taskLinks.length) {
      const tasks = await prisma.task.findMany({
        where: { id: { in: taskLinks.map((l) => l.taskId!) }, userId },
      });
      const done = tasks.filter((t) => t.status === 'DONE').length;
      taskScore = tasks.length ? done / tasks.length : null;
    }

    const present = [milestoneScore, habitScore, taskScore].filter(
      (s): s is number => s !== null,
    );
    const progress = present.length
      ? present.reduce((a, b) => a + b, 0) / present.length
      : 0;

    const rounded = Math.round(progress * 100) / 100;
    await prisma.goal.update({
      where: { id },
      data: { currentValue: rounded },
    });

    return {
      goalId: id,
      progress: rounded,
      milestoneScore:
        milestoneScore === null ? null : Math.round(milestoneScore * 100) / 100,
      habitScore:
        habitScore === null ? null : Math.round(habitScore * 100) / 100,
      taskScore: taskScore === null ? null : Math.round(taskScore * 100) / 100,
      status: goal.status,
    };
  }
}
