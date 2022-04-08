import { Controller } from '@nestjs/common';
import { mtMessageType } from '@telecom/message';
import { SubscriberService } from './subscriber.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
@Controller()
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @RabbitSubscribe({
    routingKey: process.env.QUEUE,
    queue: process.env.QUEUE,
  })
  public async subscriber(data: mtMessageType) {
    await this.subscriberService.sendMessage(data);
  }
}
