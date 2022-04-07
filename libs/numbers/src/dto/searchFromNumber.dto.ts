import mongoose from 'mongoose';

export class SearchFromNumberDto {
  number?: string; //TODO: is it okay ? user name
  userAssigned?: mongoose.Types.ObjectId;
}
