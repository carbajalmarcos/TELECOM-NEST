import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AuthModule } from '@telecom/auth';
import { rmq } from '@telecom/constants';
import { UserModule } from '@telecom/user';
import { PublisherController } from './publisher.controller';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: rmq.EXCHANGE_DIRECT_NAME,
          type: 'direct',
        },
      ],
      uri: [process.env.RMQ_URL || 'amqp://rabbitmq:5672'],
      enableControllerDiscovery: true,
      connectionInitOptions: { wait: true, timeout: 20000 },
    }),
    PublisherModule,
    AuthModule,
    UserModule,
  ],
  exports: [RabbitMQModule],
  controllers: [PublisherController],
})
export class PublisherModule {}
