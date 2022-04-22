import { Types } from 'mongoose';

export class FromNumberDto {
  id?: Types.ObjectId;
  number?: string;
  userAssigned?: Types.ObjectId;
  sentCount?: number;
  updateAt?: Date;
  locked?: boolean;
}
