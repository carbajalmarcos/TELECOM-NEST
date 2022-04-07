import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema()
export class Conversation {
  id: Types.ObjectId;

  @Prop({ required: true, index: true })
  numbers: string[];

  @Prop()
  user: Types.ObjectId;

  @Prop()
  company: string;

  @Prop()
  allowMO: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
