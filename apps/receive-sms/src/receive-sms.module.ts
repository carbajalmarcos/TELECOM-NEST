import { Module } from '@nestjs/common';
import { ReceiveSmsController } from './receive-sms.controller';
import { ReceiveSmsService } from './receive-sms.service';
import { MessageModule } from '@telecom/message';
import { AuthModule } from '@telecom/auth';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [MessageModule, HttpModule, AuthModule],
  controllers: [ReceiveSmsController],
  providers: [ReceiveSmsService],
})
export class ReceiveSmsModule {}
