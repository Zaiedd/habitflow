import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { LogWellnessDto } from './dto/log-wellness.dto';
import { WellnessService } from './wellness.service';

@ApiTags('wellness')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wellness')
export class WellnessController {
  constructor(private readonly wellness: WellnessService) {}

  @Post(':metric')
  @ApiOperation({
    summary: 'Log a wellness metric',
    description:
      'metric: sleep | water | exercise | mood | energy | stress | meditation | reading | screen_time',
  })
  log(
    @CurrentUser() user: { sub: string },
    @Param('metric') metric: string,
    @Body() dto: LogWellnessDto,
  ) {
    return this.wellness.log(user.sub, metric, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Query wellness metrics' })
  find(
    @CurrentUser() user: { sub: string },
    @Query('metrics') metrics?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.wellness.find(user.sub, metrics, from, to);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Aggregate summary per metric' })
  summary(@CurrentUser() user: { sub: string }, @Query('days') days?: string) {
    const parsed = days ? Number.parseInt(days, 10) : 7;
    return this.wellness.summary(
      user.sub,
      Number.isFinite(parsed) ? parsed : 7,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wellness record' })
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.wellness.remove(user.sub, id);
  }
}
