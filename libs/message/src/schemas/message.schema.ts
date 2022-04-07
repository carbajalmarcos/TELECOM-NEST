import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ _id: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  conversation: Types.ObjectId;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  trackId: string;

  @Prop()
  jasminResponse: string;

  @Prop()
  status: string;

  @Prop({ required: true })
  isMO: boolean;

  @Prop()
  webHookUrl: string;

  @Prop()
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
