import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { JournalService } from './journal.service';

@ApiTags('journal')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'List journal entries' })
  findAll(
    @CurrentUser() user: { sub: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.journal.findAll(user.sub, from, to);
  }

  @Post()
  @ApiOperation({ summary: 'Create a journal entry' })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateJournalDto) {
    return this.journal.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a journal entry' })
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.journal.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a journal entry' })
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    return this.journal.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a journal entry' })
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.journal.remove(user.sub, id);
  }

  @Post(':id/ai-summary')
  @ApiOperation({
    summary: 'Extract emotion, topics and sentiment (rule-based scaffold)',
  })
  aiSummary(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.journal.aiSummary(user.sub, id);
  }
}
