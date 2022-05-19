import { Module } from '@nestjs/common';
import { DbDataSeederService } from './db-data-seeder.service';
import { NumbersModule } from '@telecom/numbers';
import { CsvModule } from 'nest-csv-parser';

@Module({
  imports: [NumbersModule, CsvModule],
  providers: [DbDataSeederService],
})
export class DbDataSeederModule {}
