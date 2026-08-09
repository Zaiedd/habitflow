import { Injectable } from '@nestjs/common';
import { prisma } from '@habitflow/db';

@Injectable()
export class HealthService {
  async check(): Promise<{
    status: string;
    db: string;
    uptime: number;
    timestamp: string;
  }> {
    let db = 'down';
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }
    return {
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
