import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from '@telecom/message';
import { NumbersModule } from '@telecom/numbers';
import { AuthModule } from '@telecom/auth';

@Module({
  imports: [MessageModule, NumbersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
