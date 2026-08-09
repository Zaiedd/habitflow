import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get level, XP progress and earned badges' })
  me(@CurrentUser() user: { sub: string }) {
    return this.gamification.me(user.sub);
  }

  @Get('badges')
  @ApiOperation({ summary: 'List the full badge catalog' })
  badges() {
    return this.gamification.listBadges();
  }
}
