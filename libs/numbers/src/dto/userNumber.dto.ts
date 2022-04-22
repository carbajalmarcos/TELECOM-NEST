import mongoose from 'mongoose';
import { quarantineNumber } from '../schemas/user-number.schema';
export class UserNumberDto {
  id?: string;
  user: string; //TODO: is it okay ? user name
  currentNumber: mongoose.Types.ObjectId;
  quarantineNumbers?: quarantineNumber[];
}
