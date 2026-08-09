import { Injectable, NotFoundException } from '@nestjs/common';
import { EventType, prisma } from '@habitflow/db';
import type { CreateJournalDto } from './dto/create-journal.dto';
import type { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  async create(userId: string, dto: CreateJournalDto) {
    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        entryType: dto.entryType ?? 'FREE',
        title: dto.title,
        body: dto.body,
        mood: dto.mood,
        tags: dto.tags ?? [],
        privacy: dto.privacy ?? 'PRIVATE',
        entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
      },
    });

    await prisma.event.create({
      data: {
        userId,
        type: EventType.JOURNAL_CREATED,
        entityType: 'JOURNAL',
        entityId: entry.id,
        occurredAt: entry.entryDate,
        idempotencyKey: `journal:${entry.id}`,
      },
    });

    return entry;
  }

  async findAll(userId: string, from?: string, to?: string) {
    return prisma.journalEntry.findMany({
      where: {
        userId,
        deletedAt: null,
        entryDate: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { entryDate: 'desc' },
      take: 200,
    });
  }

  async findOne(userId: string, id: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!entry) {
      throw new NotFoundException('JOURNAL_NOT_FOUND');
    }
    return entry;
  }

  async update(userId: string, id: string, dto: UpdateJournalDto) {
    await this.findOne(userId, id);
    return prisma.journalEntry.update({
      where: { id },
      data: {
        entryType: dto.entryType,
        title: dto.title,
        body: dto.body,
        mood: dto.mood,
        tags: dto.tags,
        privacy: dto.privacy,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
        aiSummary: undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return prisma.journalEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async aiSummary(userId: string, id: string) {
    const entry = await this.findOne(userId, id);
    if (!entry.body) {
      return { emotion: 'neutral', topics: [], sentiment: 0 };
    }

    const topics = this.extractTopics(entry.body);
    const summary = {
      emotion: this.guessEmotion(entry.body, entry.mood),
      topics,
      sentiment: this.guessSentiment(entry.body, entry.mood),
    };

    await prisma.journalEntry.update({
      where: { id },
      data: { aiSummary: summary },
    });

    return summary;
  }

  private guessEmotion(body: string, mood?: number | null): string {
    const text = body.toLowerCase();
    if (/\b(sad|angry|anxious|stressed|down|tired|worried)\b/.test(text)) {
      return 'negative';
    }
    if (/\b(happy|grateful|excited|calm|proud|good|great)\b/.test(text)) {
      return 'positive';
    }
    if (mood !== null && mood !== undefined) {
      return mood >= 4 ? 'positive' : mood <= 2 ? 'negative' : 'neutral';
    }
    return 'neutral';
  }

  private guessSentiment(body: string, mood?: number | null): number {
    const text = body.toLowerCase();
    const positive = (
      text.match(
        /\b(happy|grateful|excited|calm|proud|good|great|love|enjoy)\b/g,
      ) ?? []
    ).length;
    const negative = (
      text.match(
        /\b(sad|angry|anxious|stressed|down|tired|worried|hate|bad)\b/g,
      ) ?? []
    ).length;
    const lexical = positive - negative;
    if (mood !== null && mood !== undefined) {
      const moodSignal = (mood - 3) / 2;
      return Math.max(-1, Math.min(1, (lexical + moodSignal) / 2));
    }
    return Math.max(-1, Math.min(1, lexical));
  }

  private extractTopics(body: string): string[] {
    const topicMap: Record<string, RegExp> = {
      work: /\b(work|job|meeting|project|office|boss|client)\b/i,
      health: /\b(health|doctor|sick|pain|exercise|gym|run|sleep)\b/i,
      family:
        /\b(family|mom|dad|mother|father|sister|brother|kids|wife|husband)\b/i,
      relationships: /\b(friend|date|partner|relationship|love)\b/i,
      money: /\b(money|pay|salary|bill|budget|debt)\b/i,
      study: /\b(study|exam|school|university|class|grade)\b/i,
      travel: /\b(travel|trip|flight|vacation|journey)\b/i,
    };
    return Object.keys(topicMap)
      .filter((topic) => topicMap[topic].test(body))
      .slice(0, 5);
  }
}
