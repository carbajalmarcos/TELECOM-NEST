import { NestFactory } from '@nestjs/core';
import { ReceiveSmsModule } from './receive-sms.module';

async function bootstrap() {
  const app = await NestFactory.create(ReceiveSmsModule);
  await app.listen(3001);
}
bootstrap();
