import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FromNumberDocument = FromNumber & Document;

@Schema()
export class FromNumber {
  id: Types.ObjectId;

  @Prop({ isRequired: true })
  number: string;

  @Prop({ isRequired: false })
  userAssigned: Types.ObjectId;

  @Prop({ default: 0 })
  sentCount: number;

  @Prop({ default: false })
  locked: boolean;

  @Prop({ default: false })
  removed: boolean;

  @Prop()
  updateAt: Date;
}

export const FromNumberSchema = SchemaFactory.createForClass(FromNumber);
