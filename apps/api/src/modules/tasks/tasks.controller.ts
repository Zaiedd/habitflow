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
import { TaskStatus } from '@habitflow/db';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks (optionally filtered by status)' })
  findAll(
    @CurrentUser() user: { sub: string },
    @Query('status') status?: TaskStatus,
  ) {
    return this.tasks.findAll(user.sub, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateTaskDto) {
    return this.tasks.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task' })
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.tasks.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a task' })
  archive(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.tasks.archive(user.sub, id, true);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a task as done' })
  complete(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.tasks.setStatus(user.sub, id, true);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: 'Reopen a completed task' })
  reopen(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.tasks.setStatus(user.sub, id, false);
  }
}
