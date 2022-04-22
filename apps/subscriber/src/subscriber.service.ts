import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import {
  ConversationDto,
  MessageDto,
  MessageService,
  mtMessageType,
  SearchConversationDto,
  toJasminParams,
} from '@telecom/message';
import { NumberUtils } from './utils';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { rmq } from '@telecom/constants';

@Injectable()
export class SubscriberService {
  constructor(
    private readonly messageService: MessageService,
    private readonly http: HttpService,
    private readonly numberUtils: NumberUtils, // @Inject(process.env.QUEUE) private readonly queueClient: ClientProxy, // private readonly amqpService: AMQPService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  private delayPublish(data: mtMessageType) {
    this.amqpConnection.publish(
      rmq.EXCHANGE_DELAYED_NAME,
      process.env.QUEUE,
      data,
      {
        headers: {
          'x-delay': 60000,
        },
      },
    );
    console.log('retrying message for spam rule:: ', JSON.stringify(data));
  }

  private paramsBuilder(data: mtMessageType): toJasminParams {
    const params: toJasminParams = {
      coding: 8,
      password: process.env.SEND_JASMIN_PASSOWRD,
      username: process.env.SEND_JASMIN_USERNAME,
      content: data.text,
      from: data.origin,
      to: data.destination,
    };
    return params;
  }

  private async callUrl(url: string) {
    const response = await this.http
      .get<any>(url)
      .toPromise()
      .catch((err) => {
        throw new HttpException(
          err.response.data || err,
          err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    return response.data;
  }

  private sendMessageToJasmin(data: mtMessageType) {
    try {
      const params = this.paramsBuilder(data);
      const query = Object.keys(params)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
      const url = `http://jasmin:1401/send?${query}`;

      return this.callUrl(url);
    } catch (error) {
      console.info('Sending jasmin error :: ', error);
      return error;
    }
  }
  /**
   * function checks spam rules for bidirectional flow
   * @param  {numbers: [string]}
   */
  private async isSpam(number: string) {
    const to = new Date();
    const from = new Date();
    from.setMinutes(from.getMinutes() - 1);
    const messagesResult =
      await this.messageService.findMessagesByParamsAndDateRange(
        { origin: number, isMO: false },
        from,
        to,
      );
    return messagesResult.length > rmq.SPAM_LIMIT;
  }

  async sendMessage(data: mtMessageType) {
    console.log('data ::', JSON.stringify(data));

    try {
      let jasminResponse;
      let jasminError;
      let conversationNumbers;
      try {
        const number: string = data.allowMO
          ? await this.numberUtils.getNumberForBidirectionalFlow(data.userId)
          : await this.numberUtils.getNumberForUnidirectionalFlow();
        console.log('sendMessage :: number :: ', number);
        // If number not found then retry
        if (!number) {
          console.log('sendMessage :: number 2:: ', number);
          this.delayPublish(data);
          return;
        }
        data.origin = number;
        // getting conversation numbers
        conversationNumbers = [data.origin, data.destination];
        // spam checking for bidirectional flow
        if (data.allowMO && (await this.isSpam(conversationNumbers))) {
          this.delayPublish(data);
          return;
        }
        jasminResponse = await this.sendMessageToJasmin(data);
      } catch (err) {
        console.info('Sending jasmin error :: ', err);
        jasminError = err;
      }
      const searchConversationDto = new SearchConversationDto();
      searchConversationDto.user = new Types.ObjectId(data.userId);
      searchConversationDto.numbers = conversationNumbers;
      let conversationResult =
        await this.messageService.findOneConversationByNumbersAndOthers(
          searchConversationDto,
        );

      const now = new Date();
      if (!conversationResult) {
        const conversationDto = new ConversationDto();
        conversationDto.numbers = conversationNumbers;
        conversationDto.createdAt = now;
        conversationDto.updatedAt = now;
        conversationDto.user = new Types.ObjectId(searchConversationDto.user);
        conversationDto.company = data.company;
        conversationDto.allowMO = data.allowMO;
        conversationResult = await this.messageService.createConversation(
          conversationDto,
        );
      }
      const messageDto = new MessageDto();
      messageDto.conversation = conversationResult.id;
      messageDto.text = data.text;
      messageDto.origin = data.origin;
      messageDto.destination = data.destination;
      messageDto.createdAt = now;
      messageDto.trackId = data.trackId;
      messageDto.isMO = false;
      messageDto.webHookUrl = data.webHookUrl;
      messageDto.jasminResponse = jasminError
        ? jasminError.toString()
        : jasminResponse;
      messageDto.status = jasminError ? 'error' : 'sent';

      const newMessage = await this.messageService.createMessage(messageDto);
      const conversationSaved = await this.messageService.updateConversation(
        conversationResult.id,
        { ...conversationResult, updatedAt: now },
      );

      console.info(`MT message saved ::`, JSON.stringify(newMessage));
      console.info(`Conversation saved ::`, JSON.stringify(conversationSaved));
    } catch (error) {
      console.log(`creating message error ::`, error);
    }
  }
}
