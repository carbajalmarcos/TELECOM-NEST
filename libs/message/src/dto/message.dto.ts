import { Types } from 'mongoose';

export class MessageDto {
  origin: string;
  destination: string;
  text: string;
  status: string;
  jasminResponse: string;
  conversation: Types.ObjectId;
  createdAt: Date;
  isMO: boolean;
  trackId: string;
  webHookUrl?: string;
}

export class SearchMessageDto {
  origin?: string;
  destination?: string;
  text?: string;
  status?: string;
  jasminResponse?: string;
  conversation?: Types.ObjectId;
  createdAt?: Date;
  isMO?: boolean;
  trackId?: string;
}
