import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { BatchSyncDto, IngestEventDto } from './dto/ingest-event.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Ingest a single behavioral event' })
  ingest(@CurrentUser() user: { sub: string }, @Body() dto: IngestEventDto) {
    return this.events.ingest(user.sub, dto);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Replay buffered offline events (idempotent batch)',
  })
  sync(@CurrentUser() user: { sub: string }, @Body() dto: BatchSyncDto) {
    return this.events.syncBatch(user.sub, dto);
  }
}
