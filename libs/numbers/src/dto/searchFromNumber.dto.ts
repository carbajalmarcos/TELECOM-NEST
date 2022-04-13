import mongoose from 'mongoose';

export class SearchFromNumberDto {
  number?: string;
  userAssigned?: mongoose.Types.ObjectId;
  updateAt?: Date;
  sentCount?: number;
  locked?: boolean;
}
