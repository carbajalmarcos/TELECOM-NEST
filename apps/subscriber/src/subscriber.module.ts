import { Module } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { HttpModule } from '@nestjs/axios';
import { NumberUtils } from './utils';
import { MessageModule } from '@telecom/message';
import { NumbersModule } from '@telecom/numbers';
import { SubscriberController } from './subscriber.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { rmq } from '@telecom/constants';

@Module({
  imports: [
    HttpModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: rmq.EXCHANGE_DIRECT_NAME,
          type: rmq.EXCHANGE_DIRECT_TYPE,
        },
        {
          name: rmq.EXCHANGE_DELAYED_NAME,
          type: rmq.EXCHANGE_DELAYED_TYPE,
          options: {
            durable: true,
            arguments: { 'x-delayed-type': rmq.EXCHANGE_DIRECT_TYPE },
          },
        },
      ],
      uri: process.env.RMQ_URL || 'amqp://localhost:5672',
      enableControllerDiscovery: true,
      connectionInitOptions: { wait: true, timeout: 20000 },
    }),
    SubscriberModule,
    MessageModule,
    NumbersModule,
  ],
  providers: [SubscriberService, NumberUtils],
  controllers: [SubscriberController],
})
export class SubscriberModule {}
