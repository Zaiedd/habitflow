import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@habitflow/db';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  async findAll(userId: string) {
    return prisma.habitCategory.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      include: { _count: { select: { habits: true } } },
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const existing = await prisma.habitCategory.findFirst({
      where: { userId, name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('CATEGORY_EXISTS');
    }
    return prisma.habitCategory.create({
      data: {
        userId,
        name,
        icon: dto.icon,
        color: dto.color,
        sort: dto.sort ?? 0,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(userId, id);
    return prisma.habitCategory.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await prisma.habit.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    return prisma.habitCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async findOne(userId: string, id: string) {
    const category = await prisma.habitCategory.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('CATEGORY_NOT_FOUND');
    }
    return category;
  }
}
