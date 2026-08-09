import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventType, Prisma, prisma, WellnessMetricType } from '@habitflow/db';
import type { LogWellnessDto } from './dto/log-wellness.dto';

type WellnessRecord = Prisma.WellnessMetricGetPayload<Record<string, never>>;

@Injectable()
export class WellnessService {
  async log(userId: string, metric: string, dto: LogWellnessDto) {
    const type = this.parseMetric(metric);
    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    const data = {
      userId,
      metric: type,
      occurredAt,
      value: dto.value,
      unit: dto.unit,
      extra: dto.extra,
      source: dto.source ?? 'APP',
      externalId: dto.externalId,
    };

    let record: WellnessRecord;
    if (dto.externalId) {
      record = await prisma.wellnessMetric.upsert({
        where: {
          userId_metric_externalId: {
            userId,
            metric: type,
            externalId: dto.externalId,
          },
        },
        create: data,
        update: data,
      });
    } else {
      record = await prisma.wellnessMetric.create({ data });
    }

    await prisma.event.create({
      data: {
        userId,
        type: EventType.WELLNESS_LOGGED,
        entityType: 'WELLNESS',
        entityId: record.id,
        occurredAt,
        tzOffsetMin: dto.tzOffsetMin ?? 0,
        payload: { metric: type, value: dto.value },
        idempotencyKey: `wellness:${record.id}`,
      },
    });

    return record;
  }

  async find(userId: string, metrics?: string, from?: string, to?: string) {
    const list = metrics
      ? metrics.split(',').map((m) => this.parseMetric(m.trim()))
      : undefined;

    return prisma.wellnessMetric.findMany({
      where: {
        userId,
        metric: list ? { in: list } : undefined,
        occurredAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { occurredAt: 'desc' },
      take: 500,
    });
  }

  async summary(userId: string, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await prisma.wellnessMetric.groupBy({
      by: ['metric'],
      where: { userId, occurredAt: { gte: since } },
      _count: { _all: true },
      _avg: { value: true },
      _min: { value: true },
      _max: { value: true },
    });
    return {
      periodDays: days,
      metrics: rows.map((r) => ({
        metric: r.metric,
        count: r._count._all,
        avg:
          r._avg.value === null ? null : Math.round(r._avg.value * 100) / 100,
        min: r._min.value,
        max: r._max.value,
      })),
    };
  }

  async remove(userId: string, id: string) {
    const record = await prisma.wellnessMetric.findFirst({
      where: { id, userId },
    });
    if (!record) {
      throw new NotFoundException('WELLNESS_NOT_FOUND');
    }
    await prisma.wellnessMetric.delete({ where: { id } });
    return { ok: true };
  }

  private parseMetric(metric: string): WellnessMetricType {
    const upper = metric.toUpperCase();
    if (!(upper in WellnessMetricType)) {
      throw new BadRequestException(`UNKNOWN_METRIC: ${metric}`);
    }
    return WellnessMetricType[upper as keyof typeof WellnessMetricType];
  }
}
