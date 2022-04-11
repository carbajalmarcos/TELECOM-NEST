import mongoose from 'mongoose';

export type mtMessageType = {
  origin?: string;
  destination: string;
  text: string;
  status?: string;
  jasminResponse?: string;
  conversation?: mongoose.Types.ObjectId;
  createdAt?: Date;
  isMO?: boolean;
  trackId?: string;
  userId?: string;
  company?: string;
  allowMO?: boolean;
  webHookUrl?: string;
};

export type moMessageType = {
  origin: string;
  destination: string;
  text: string;
  status?: string;
  jasminResponse?: string;
  conversation?: mongoose.Types.ObjectId;
  createdAt?: Date;
  isMO: boolean;
  trackId?: string;
};

export type toJasminParams = {
  username: string;
  password: string;
  content: string;
  coding: number;
  from: string;
  to: string;
};
