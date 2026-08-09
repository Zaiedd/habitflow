import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventType, prisma, TaskStatus } from '@habitflow/db';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  async create(userId: string, dto: CreateTaskDto) {
    if (dto.parentId) {
      const parent = await prisma.task.findFirst({
        where: { id: dto.parentId, userId },
      });
      if (!parent) {
        throw new BadRequestException('PARENT_NOT_FOUND');
      }
    }
    return prisma.task.create({
      data: {
        userId,
        title: dto.title,
        notes: dto.notes,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        dueTzOffsetMin: dto.dueTzOffsetMin,
        priority: dto.priority ?? 0,
        estimatedMin: dto.estimatedMin,
        parentId: dto.parentId,
        tags: dto.tags ?? [],
        order: dto.order ?? 0,
      },
    });
  }

  async findAll(userId: string, status?: TaskStatus) {
    return prisma.task.findMany({
      where: {
        userId,
        archivedAt: null,
        parentId: null,
        status,
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
      include: { subtasks: true },
    });
  }

  async findOne(userId: string, id: string) {
    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: { subtasks: true },
    });
    if (!task) {
      throw new NotFoundException('TASK_NOT_FOUND');
    }
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(userId, id);
    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException('INVALID_PARENT');
    }
    return prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        notes: dto.notes,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        dueTzOffsetMin: dto.dueTzOffsetMin,
        priority: dto.priority,
        estimatedMin: dto.estimatedMin,
        parentId: dto.parentId,
        tags: dto.tags,
        order: dto.order,
      },
      include: { subtasks: true },
    });
  }

  async setStatus(userId: string, id: string, done: boolean) {
    await this.findOne(userId, id);
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: done ? 'DONE' : 'TODO',
        completedAt: done ? new Date() : null,
      },
      include: { subtasks: true },
    });

    if (done) {
      await prisma.event.create({
        data: {
          userId,
          type: EventType.TASK_DONE,
          entityType: 'TASK',
          entityId: id,
          occurredAt: new Date(),
          idempotencyKey: `task-done:${id}:${done}`,
        },
      });
    }

    return task;
  }

  async archive(userId: string, id: string, archived: boolean) {
    await this.findOne(userId, id);
    return prisma.task.update({
      where: { id },
      data: { archivedAt: archived ? new Date() : null },
    });
  }
}
