import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserNumberDocument = UserNumber & Document;

export type quarantineNumber = {
  number: Types.ObjectId;
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
  quarantineNumbers: quarantineNumber[];
}

export const UserNumberSchema = SchemaFactory.createForClass(UserNumber);
