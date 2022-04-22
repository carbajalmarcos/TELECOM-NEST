import { Module } from '@nestjs/common';
import { DbBackuperService } from './db-backuper.service';
import { MessageModule } from '@telecom/message';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [MessageModule, ScheduleModule.forRoot()],
  providers: [DbBackuperService],
})
export class DbBackuperModule {}
