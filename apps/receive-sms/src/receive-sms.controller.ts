import { Controller, Post, Query, Res } from '@nestjs/common';
import { ReceiveSmsService } from './receive-sms.service';
import { Response } from 'express';
import { moMessageType } from '@telecom/message';

@Controller()
export class ReceiveSmsController {
  constructor(private readonly receiveSmsService: ReceiveSmsService) {}

  @Post('/receive')
  async findUsingLibrary(@Query() query, @Res() response: Response) {
    response.send('OK');
    const message: moMessageType = {
      origin: query.source_addr,
      destination: query.destination_addr,
      text: query.short_message || query.content,
      isMO: true,
    };
    this.receiveSmsService.receiveMessage(message);
  }
}
