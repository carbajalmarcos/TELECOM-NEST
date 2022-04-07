import {
  Controller,
  Post,
  Body,
  Request,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '@telecom/auth';
import { UserService } from '@telecom/user';
import { rmq } from '@telecom/constants';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Controller()
export class PublisherController {
  constructor(
    private usersService: UserService,
    private readonly amqpConnection: AmqpConnection,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post('/send')
  async sendMessage(
    @Body() message,
    @Request() req,
    @Res() res: Response,
  ): Promise<any> {
    const user = await this.usersService.findOne(req.user.username);
    const trackId = uuidv4();
    const messageToSend = {
      ...message,
      userId: user.userId,
      company: user.company,
      allowMO: user.allowMO,
      trackId,
      webHookUrl: message.webHookUrl || user.defaultWebHook,
    };
    // depends of priority user configuration
    this.amqpConnection.publish(
      rmq.EXCHANGE_DIRECT_NAME,
      user.priority === 'urgent' ? rmq.URGENT_FLOW : rmq.NORMAL_FLOW,
      messageToSend,
    );

    res.status(HttpStatus.ACCEPTED).send(messageToSend);
  }
}
