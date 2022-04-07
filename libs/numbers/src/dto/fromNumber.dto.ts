import mongoose from 'mongoose';

export class FromNumberDto {
  number?: string;
  userAssigned?: mongoose.Types.ObjectId; //TODO: is it okay ?
}
