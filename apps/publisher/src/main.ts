import { NestFactory } from '@nestjs/core';
import { PublisherModule } from './publisher.module';

async function bootstrap() {
  const app = await NestFactory.create(PublisherModule);
  await app.listen(3000);
}
bootstrap();
