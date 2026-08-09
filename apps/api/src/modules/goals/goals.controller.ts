import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { SetGoalLinksDto } from './dto/set-goal-links.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { GoalsService } from './goals.service';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'List goals' })
  findAll(@CurrentUser() user: { sub: string }) {
    return this.goals.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a SMART goal' })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateGoalDto) {
    return this.goals.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal' })
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.goals.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goals.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a goal' })
  archive(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.goals.archive(user.sub, id, true);
  }

  @Post(':id/milestones')
  @ApiOperation({ summary: 'Add a milestone' })
  addMilestone(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.goals.addMilestone(user.sub, id, dto);
  }

  @Patch(':id/milestones/:milestoneId')
  @ApiOperation({ summary: 'Update a milestone' })
  updateMilestone(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.goals.updateMilestone(user.sub, id, milestoneId, dto);
  }

  @Put(':id/links')
  @ApiOperation({ summary: 'Link habits/tasks to a goal' })
  setLinks(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: SetGoalLinksDto,
  ) {
    return this.goals.setLinks(user.sub, id, dto);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Compute goal progress' })
  progress(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.goals.progress(user.sub, id);
  }
}
