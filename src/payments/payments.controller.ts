import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { MessagePattern } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  @MessagePattern('payment.session.create')
  createPaymentSession(@Body() dt: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(dt);
  }

  @Get('success')
  @MessagePattern('payment.success')
  success() {
    return {
      ok: true,
      message: 'Payment successful',
    }
  }

  @Get('cancelled')
  @MessagePattern('payment.cancelled')
  cancelled() {
    return {
      ok: false,
      message: 'Payment cancelled',
    }
  }

  @Post('webhook')
  @MessagePattern('payment.webhook')
  async stripeWebhook(@Req() request: Request, @Res() response: Response) {
    return this.paymentsService.stripeWebHook(request, response);
  }
}
