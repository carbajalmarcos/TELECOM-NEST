import { Types } from 'mongoose';

export class ConversationDto {
  numbers: string[];
  user: Types.ObjectId;
  company: string;
  allowMO?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SearchConversationDto {
  numbers?: string[];
  user?: Types.ObjectId;
  company?: string;
  allowMO?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
