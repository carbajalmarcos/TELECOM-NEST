import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './schemas/message.schema';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';

@Module({
  providers: [MessageService],
  exports: [MessageService],
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.DB_USERNAME}:${
        process.env.DB_PASSWORD
      }@mongodb:${process.env.MONGO_DB_PORT ?? '27017'}/${
        process.env.MESSAGE_DB
      }?authSource=admin`,
      {
        connectionName: 'messages',
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('is connected');
          });
          connection.on('disconnected', () => {
            console.log('DB disconnected');
          });
          connection.on('error', (error) => {
            console.log('DB connection failed! for error: ', error);
          });
          return connection;
        },
      },
    ),
    MongooseModule.forFeature(
      [
        { name: Message.name, schema: MessageSchema },
        { name: Conversation.name, schema: ConversationSchema },
      ],
      'messages',
    ),
  ],
})
export class MessageModule {}
