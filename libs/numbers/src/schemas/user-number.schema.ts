import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserNumberDocument = UserNumber & Document;

export type quarantineNumber = {
  number: string;
  updateAt: Date;
};

@Schema()
export class UserNumber {
  id: Types.ObjectId;

  @Prop({ isRequired: true })
  user: string;

  @Prop({ isRequired: false })
  currentNumber: Types.ObjectId;

  @Prop({ isRequired: false })
  quarantineNumber: [quarantineNumber];
}

export const UserNumberSchema = SchemaFactory.createForClass(UserNumber);
