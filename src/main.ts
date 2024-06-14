import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { envs } from './config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Payments-ms')

  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )

  await app.listen(envs.PORT);

  logger.log(`PaymentsMicroservice is running on port ${envs.PORT}`)
}
bootstrap();
