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
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitsService } from './habits.service';

@ApiTags('habits')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habits: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'List user habits' })
  findAll(
    @CurrentUser() user: { sub: string },
    @Query('archived') archived?: string,
  ) {
    return this.habits.findAll(user.sub, archived === 'true');
  }

  @Post()
  @ApiOperation({ summary: 'Create a habit' })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateHabitDto) {
    return this.habits.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a habit' })
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.habits.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habits.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a habit' })
  archive(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.habits.archive(user.sub, id, true);
  }

  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Restore an archived habit' })
  unarchive(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.habits.archive(user.sub, id, false);
  }

  @Post(':id/completions')
  @ApiOperation({ summary: 'Complete a habit (idempotent)' })
  complete(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: CompleteHabitDto,
  ) {
    return this.habits.complete(user.sub, id, dto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Habit streak & completion stats' })
  stats(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.habits.stats(user.sub, id);
  }
}
