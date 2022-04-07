import { Module } from '@nestjs/common';
import { DbBackuperService } from './db-backuper.service';
import { MessageModule } from '@telecom/message';

@Module({
  imports: [MessageModule],
  providers: [DbBackuperService],
})
export class DbBackuperModule {}
