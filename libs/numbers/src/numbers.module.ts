import { Module } from '@nestjs/common';
import { NumberService } from './numbers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FromNumber, FromNumberSchema } from './schemas/from-number.schema';
import { UserNumber, UserNumberSchema } from './schemas/user-number.schema';

@Module({
  providers: [NumberService],
  exports: [NumberService],
  imports: [
    MongooseModule.forRoot(
      // `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mongodb:27017/?authMechanism=SCRAM-SHA-1&directConnection=true&authSource=${process.env.NUMBERS_DB}`,
      `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mongodb:27017/${process.env.NUMBERS_DB}?authSource=admin`,
      {
        connectionName: 'numbers',
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
        { name: FromNumber.name, schema: FromNumberSchema },
        { name: UserNumber.name, schema: UserNumberSchema },
      ],
      'numbers',
    ),
  ],
})
export class NumbersModule {}
