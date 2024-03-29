import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  MessageService,
  moMessageType,
  MessageDto,
  SearchConversationDto,
} from '@telecom/message';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { ConversationDocument } from '@telecom/message/schemas/conversation.schema';

@Injectable()
export class ReceiveSmsService {
  constructor(
    private readonly messageService: MessageService,
    private readonly http: HttpService,
  ) {}

  private async callUrl(url, data) {
    try {
      const response = await this.http
        .post<any>(url, data)
        .toPromise()
        .catch((err) => {
          console.info('err pipeline ::', err);
          throw new HttpException(
            err.response?.data || err,
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        });
      return response;
    } catch (e) {
      console.info(e);
    }
  }

  async receiveMessage(data: moMessageType) {
    try {
      const conversationNumbers = [data.destination, data.origin];
      const searchConversationDto = new SearchConversationDto();
      searchConversationDto.numbers = conversationNumbers;
      const conversationResult =
        (await this.messageService.findOneConversationByNumbersAndOthers(
          searchConversationDto,
        )) as ConversationDocument;
      const now = new Date();

      if (!conversationResult) return;
      if (!conversationResult.allowMO) {
        console.info(
          'conversation not allow Mo ::',
          JSON.stringify(conversationResult),
        );
        return;
      }
      const messageDto = new MessageDto();
      const trackId = uuidv4();
      messageDto.conversation = conversationResult._id;
      messageDto.text = data.text;
      messageDto.origin = data.origin;
      messageDto.destination = data.destination;
      messageDto.createdAt = now;
      messageDto.status = 'received';
      messageDto.isMO = data.isMO;
      messageDto.trackId = trackId;
      const newMessage = await this.messageService.createMessage(messageDto);
      const conversationSaved = await this.messageService.updateConversation(
        conversationResult._id,
        { ...conversationResult, updatedAt: now },
      );
      console.info(`MO message saved ::`, JSON.stringify(newMessage));
      console.info(`Conversation saved ::`, JSON.stringify(conversationSaved));
      const lastMtMessage = await this.messageService.findLastMtMessage(
        conversationResult._id,
      );

      if (lastMtMessage.webHookUrl && lastMtMessage.webHookUrl.length) {
        this.callUrl(lastMtMessage.webHookUrl, messageDto);
      }
    } catch (error) {
      console.info(`creating message error ::`, error);
    }
  }
}
