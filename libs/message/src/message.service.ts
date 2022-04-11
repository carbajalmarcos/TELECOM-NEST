import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { MessageDto } from './dto/message.dto';
import { ConversationDto, SearchConversationDto } from './dto/conversation.dto';
import { SearchMessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findOneConversationByNumbersAndOthers(
    searchConversationDto: SearchConversationDto,
  ): Promise<Conversation> {
    return await this.conversationModel
      .findOne({
        numbers: { $all: searchConversationDto.numbers },
        ...searchConversationDto,
      })
      .exec();
  }

  async findOneConversation(
    id: string | Types.ObjectId,
  ): Promise<Conversation> {
    if (!Types.ObjectId.isValid(id)) return new Conversation();
    return await this.conversationModel.findById(id).exec();
  }

  async createConversation(
    createConversationDto: ConversationDto,
  ): Promise<Conversation> {
    const searchConversationDto = new SearchConversationDto();
    searchConversationDto.numbers = createConversationDto.numbers;
    searchConversationDto.user = createConversationDto.user;
    const exists = await this.findOneConversationByNumbersAndOthers(
      searchConversationDto,
    );
    if (exists) return exists;
    return await new this.conversationModel({
      ...createConversationDto,
    }).save();
  }

  async updateConversation(
    id: Types.ObjectId,
    conversationDto: ConversationDto,
  ): Promise<Conversation> {
    return await this.conversationModel
      .findByIdAndUpdate(id, conversationDto)
      .exec();
  }

  async deleteConversation(id: string): Promise<Conversation> {
    return await this.conversationModel.findByIdAndDelete(id).exec();
  }

  async findOneMessage(id: string): Promise<Message> {
    if (!Types.ObjectId.isValid(id)) return new Message();
    return await this.messageModel.findById(id).exec();
  }

  async findMessages(
    searchMessageDto: SearchMessageDto,
  ): Promise<Array<Message>> {
    return await this.messageModel.find(searchMessageDto).exec();
  }

  async findMessage(searchMessageDto: SearchMessageDto): Promise<Message> {
    return await this.messageModel.findOne(searchMessageDto).exec();
  }

  async findMessagesByParamsAndDateRange(
    searchMessageDto: SearchMessageDto,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<Array<Message>> {
    return await this.messageModel
      .find({
        ...searchMessageDto,
        createdAt: {
          $gte: dateFrom,
          $lt: dateTo,
        },
      })
      .exec();
  }

  async createMessage(createMessageDto: MessageDto): Promise<Message> {
    return await new this.messageModel({
      ...createMessageDto,
    }).save();
  }

  async updateMessage(
    id: string,
    updateMessageDto: MessageDto,
  ): Promise<Message> {
    return await this.messageModel
      .findByIdAndUpdate(id, updateMessageDto)
      .exec();
  }

  async deleteMessage(id: string): Promise<Message> {
    return await this.messageModel.findByIdAndDelete(id).exec();
  }

  async findLastMtMessage(conversationId: Types.ObjectId): Promise<Message> {
    return await this.messageModel
      .findOne({ conversation: conversationId, isMO: false })
      .sort({ createdAt: -1 })
      .exec();
  }
}
