import { Injectable, Logger } from '@nestjs/common';
import { Prisma, prisma } from '@habitflow/db';
import type { BatchSyncDto, IngestEventDto } from './dto/ingest-event.dto';

export interface IngestResult {
  event: unknown;
  idempotent: boolean;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  async ingest(userId: string, dto: IngestEventDto): Promise<IngestResult> {
    const existing = await prisma.event.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      return { event: existing, idempotent: true };
    }

    const event = await prisma.event.create({
      data: {
        userId,
        type: dto.type,
        occurredAt: new Date(dto.occurredAt),
        tzOffsetMin: dto.tzOffsetMin ?? 0,
        entityType: dto.entityType,
        entityId: dto.entityId,
        payload: dto.payload as Prisma.InputJsonValue | undefined,
        idempotencyKey: dto.idempotencyKey,
      },
    });

    return { event, idempotent: false };
  }

  async syncBatch(userId: string, dto: BatchSyncDto) {
    const results: IngestResult[] = [];
    for (const item of dto.items) {
      try {
        results.push(await this.ingest(userId, item));
      } catch (error) {
        this.logger.warn(`Batch item failed: ${(error as Error).message}`);
        results.push({
          event: { error: (error as Error).message },
          idempotent: false,
        });
      }
    }
    const created = results.filter((r) => !r.idempotent).length;
    return { received: results.length, created, results };
  }
}
