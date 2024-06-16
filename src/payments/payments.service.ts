import { Inject, Injectable, Logger } from '@nestjs/common';
import { NATS_SERVICE, envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_SECRET);
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

  async createPaymentSession(dt: PaymentSessionDto) {
    const { currency, items, orderId } = dt;

    const line_items = items.map((item) => ({
        price_data: {
            currency,
            product_data: {
                name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity
    }));

    const session = await this.stripe.checkout.sessions.create({
        payment_intent_data: {
            metadata: {
                orderId
            }
        },
        line_items,
        mode: 'payment',
        success_url: envs.STRIPE_SUCCESS_URL,
        cancel_url: envs.STRIPE_CANCEL_URL
    });
    return { cancelUrl: session.cancel_url, successUrl: session.success_url, url: session.url };
  }

  async stripeWebHook(request: Request, response: Response) {
    const sig = request.headers['stripe-signature'];

    let event: Stripe.Event;
    const endpointSecret = envs.STRIPE_ENDPOINT_SECRET;
    
    try {
        event = this.stripe.webhooks.constructEvent(request['rawBody'], sig, endpointSecret);
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }

    switch (event.type) {
        case 'charge.succeeded':
            //TODO LLmar nuestro microservicio
            const chargeSucceeded = event.data.object;
            const payload = {
                stripePaymentId: chargeSucceeded.id,
                orderId: chargeSucceeded.metadata.orderId,
                receiptUrl: chargeSucceeded.receipt_url
            }
            this.natsClient.emit('payment.succeded', payload);
            // this.logger.log({ payload });
        break;
        default:
            this.logger.log(`Evento ${event.type} not handled`);
    }

    return response.status(200).json({ sig });
  }

}
