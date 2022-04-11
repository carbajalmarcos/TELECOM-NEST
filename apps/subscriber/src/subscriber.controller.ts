import { Controller } from '@nestjs/common';
import { mtMessageType } from '@telecom/message';
import { SubscriberService } from './subscriber.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { rmq } from '@telecom/constants';
@Controller()
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @RabbitSubscribe({
    exchange: rmq.EXCHANGE_DIRECT_NAME,
    routingKey: process.env.QUEUE,
    queue: process.env.QUEUE,
  })
  public async subscriber(data: mtMessageType) {
    await this.subscriberService.sendMessage(data);
  }

  @RabbitSubscribe({
    exchange: rmq.EXCHANGE_DELAYED_NAME,
    routingKey: process.env.QUEUE,
    queue: process.env.QUEUE,
  })
  public async subscriberDelayed(data: mtMessageType) {
    await this.subscriberService.sendMessage(data);
  }
}
