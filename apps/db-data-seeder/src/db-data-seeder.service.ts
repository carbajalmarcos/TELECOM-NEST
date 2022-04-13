import { Injectable } from '@nestjs/common';
import { NumberService } from '@telecom/numbers';

@Injectable()
export class DbDataSeederService {
  constructor(private readonly numberService: NumberService) {}

  async seed() {
    const seedersLoaded = [];
    const date = new Date();
    const NUMBERS_QUANTITY = 10000;
    for (let i = 0; i < NUMBERS_QUANTITY; i++) {
      seedersLoaded.push(this.singleSeder(i, date));
    }
    await Promise.all(seedersLoaded);
  }

  private async singleSeder(i: number, date: Date) {
    const formattedNumber = i.toString().padStart(4, '0');
    const numberExists = await this.numberService.findOneFromNumber({
      number: formattedNumber,
    });

    if (!numberExists) {
      const number = await this.numberService.createFromNumber({
        number: formattedNumber,
        updateAt: date,
        sentCount: 0,
        locked: false,
        userAssigned: null,
      });
      console.info('saved  number ::', JSON.stringify(number));
    } else {
      console.info('number already exists :: ', JSON.stringify(numberExists));
    }
  }
}
