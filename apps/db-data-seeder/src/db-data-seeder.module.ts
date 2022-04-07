import { Module } from '@nestjs/common';
import { DbDataSeederService } from './db-data-seeder.service';
import { NumbersModule } from '@telecom/numbers';

@Module({
  imports: [NumbersModule],
  providers: [DbDataSeederService],
})
export class DbDataSeederModule {}
