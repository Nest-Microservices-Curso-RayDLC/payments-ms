import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() dt: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(dt);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment successful',
    }
  }

  @Get('cancelled')
  cancelled() {
    return {
      ok: false,
      message: 'Payment cancelled',
    }
  }

  @Post('webhook')
  async stripeWebhook(@Req() request: Request, @Res() response: Response) {
    return this.paymentsService.stripeWebHook(request, response);
  }
}
