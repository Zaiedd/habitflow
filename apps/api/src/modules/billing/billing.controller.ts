import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('subscription')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Current plan and subscription' })
  subscription(@CurrentUser() user: { sub: string }) {
    return this.billing.getSubscription(user.sub);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Start a Stripe checkout for a paid plan' })
  checkout(@CurrentUser() user: { sub: string }, @Body() dto: CheckoutDto) {
    return this.billing.checkout(user.sub, dto.plan, dto.interval, dto.locale);
  }

  @Post('portal')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Open the Stripe billing portal' })
  portal(@CurrentUser() user: { sub: string }) {
    return this.billing.portal(user.sub);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook' })
  webhook(@Req() req: RawBodyRequest<Request>) {
    return this.billing.handleWebhook(req);
  }
}
