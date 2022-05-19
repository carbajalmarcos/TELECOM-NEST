import { SearchFromNumberDto } from './../../../libs/numbers/src/dto/searchFromNumber.dto';
import { Injectable } from '@nestjs/common';
import { NumberService } from '@telecom/numbers';
import { utils } from '@telecom/constants';
import { createReadStream, readFileSync } from 'fs';
import { CsvParser } from 'nest-csv-parser';

class DataEntity {
  number: string;
  action: string;
}
interface IDataEntity {
  number: string;
  action: string;
}
@Injectable()
export class DbDataSeederService {
  constructor(
    private readonly numberService: NumberService,
    private readonly csvParser: CsvParser,
  ) {}

  async readFile() {
    const path = `${__dirname}/numbers.csv`;
    const csv = createReadStream(path);
    const entities = await this.csvParser.parse(csv, DataEntity, null, null, {
      separator: ',',
    });
    console.log('************** Csv numbers **************');
    console.log(entities);
    return entities;
  }

  async seed() {
    const { list } = await this.readFile();
    const searchFromNumberDto = new SearchFromNumberDto();
    const seedersLoaded = list.map((number: IDataEntity, i) => {
      searchFromNumberDto.number = number.number;
      searchFromNumberDto.removed = number.action === 'remove';
      searchFromNumberDto.updateAt = new Date();
      return this.numberService.updateOrInsertFromNumber(searchFromNumberDto);
    });
    await Promise.all(seedersLoaded);
  }
}
