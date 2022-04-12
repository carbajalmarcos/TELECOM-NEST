import { Injectable } from '@nestjs/common';
import { UserNumberDto, NumberService, FromNumberDto } from '@telecom/numbers';
import { rmq } from '@telecom/constants';

@Injectable()
export class NumberUtils {
  constructor(private readonly numberService: NumberService) {}

  /**
   * get the origin number
   * @param  {String} user name
   */
  async getNumberForBidirectionalFlow(user: string): Promise<string> {
    try {
      const userNumberResult = await this.numberService.findOneUserNumber({
        user,
      });
      // it checks if  user has assigned number
      if (userNumberResult) {
        const fromNumberResult = await this.numberService.findOneFromNumberById(
          userNumberResult.currentNumber,
        );
        return fromNumberResult.number;
      }
      // we find one number without assignment
      let fromNumberResult;

      fromNumberResult =
        await this.numberService.findOneNonAssignedFromNumber()
      if (!fromNumberResult) fromNumberResult = await this.getFromNumber();
      const userNumberDto = new UserNumberDto();
      userNumberDto.user = user;
      userNumberDto.currentNumber = fromNumberResult.id;
      //after getting number we proceed to create a entity user number
      const savedUserNumberResult = await this.numberService.createUserNumber(
        userNumberDto,
      );
      // updating orign number (assigned user field updated)
      const updateFromNumberResult = await this.numberService.updateFromNumber(
        fromNumberResult.id,
        { userAssigned: savedUserNumberResult.id },
      );
      return updateFromNumberResult.number;
    } catch (error) {
      return null;
    }
  }

  async getNumberForUnidirectionalFlow(): Promise<string> {
    try {
      const result = await this.getFromNumber();
      return result.number;
    } catch (error) {
      return null;
    }
  }

  async getFromNumber(): Promise<FromNumberDto> {
    const from = new Date();
    from.setMinutes(from.getMinutes() - 1);
    const result = await this.numberService.findOneUserNumberRoundRobin(
      from,
      rmq.SPAM_LIMIT,
    );
    if (!result) return null;
    const fromNumberDto = new FromNumberDto();
    fromNumberDto.id = result.id;
    fromNumberDto.number = result.number;
    fromNumberDto.sentCount = result.sentCount;
    // first time, setting sentCount
    if (!result.sentCount) {
      fromNumberDto.sentCount = 1;
    }
    // sent count is less than spam limit
    else if (fromNumberDto.sentCount < rmq.SPAM_LIMIT) {
      fromNumberDto.sentCount = fromNumberDto.sentCount + 1;
    }
    // updateAt exceeded one minute
    else {
      fromNumberDto.sentCount = 1;
    }
    fromNumberDto.updateAt = new Date();

    const updateResult = await this.numberService.updateFromNumber(result.id, {
      ...fromNumberDto,
    });

    return updateResult;
  }
}
