import { Injectable } from '@nestjs/common';
import { UserNumberDto, NumberService, FromNumberDto } from '@telecom/numbers';
import { rmq } from '@telecom/constants';
import {
  FromNumber,
  FromNumberDocument,
} from '@telecom/numbers/schemas/from-number.schema';

@Injectable()
export class NumberUtils {
  constructor(private readonly numberService: NumberService) {}
  /**
   * get the origin number
   * @param  {String} user name
   */
  async getNumberForBidirectionalFlow(user: string): Promise<string> {
    // we find one number without assignment
    let fromNumberResult;
    try {
      const userNumberResult = await this.numberService.findOneUserNumber({
        user,
      });
      // it checks if  user has assigned number
      if (userNumberResult && userNumberResult !== null) {
        const fromNumberResult = await this.numberService.findOneFromNumberById(
          userNumberResult.currentNumber,
        );
        if (!fromNumberResult.removed) {
          return fromNumberResult.number;
        }
      }

      fromNumberResult =
        (await this.numberService.findOneNonAssignedFromNumber()) as FromNumber;
      if (!fromNumberResult)
        fromNumberResult = (await this.getFromNumber()) as FromNumber;
      const userNumberDto = new UserNumberDto();
      userNumberDto.user = user;
      userNumberDto.currentNumber = fromNumberResult._id;
      //after getting number we proceed to create a entity user number
      const savedUserNumberResult = await this.numberService.createUserNumber(
        userNumberDto,
      );
      // updating orign number (assigned user field updated) and unlock the number
      const updateFromNumberResult = await this.numberService.updateFromNumber(
        fromNumberResult._id,
        { userAssigned: savedUserNumberResult.id, locked: false },
      );
      return updateFromNumberResult.number;
    } catch (error) {
      if (fromNumberResult) {
        await this.numberService.unlockNumber(fromNumberResult._id);
      }
      return null;
    }
  }

  async getNumberForUnidirectionalFlow(): Promise<string> {
    try {
      const result = (await this.getFromNumber()) as FromNumberDocument;
      // unlock the number
      await this.numberService.unlockNumber(result._id);
      return result.number;
    } catch (error) {
      return null;
    }
  }

  async getFromNumber(): Promise<FromNumber> {
    let result;
    try {
      const from = new Date();
      from.setMinutes(from.getMinutes() - 1);
      console.log('START LOCKER');
      result = (await this.numberService.findOneUserNumberRoundRobin(
        from,
        rmq.SPAM_LIMIT,
      )) as FromNumberDocument;
      if (!result) return null;
      const fromNumberDto = new FromNumberDto();
      fromNumberDto.id = result._id;
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

      const updateResult = await this.numberService.updateFromNumber(
        result._id,
        {
          ...fromNumberDto,
        },
      );
      return updateResult;
    } catch (error) {
      if (result) {
        await this.numberService.unlockNumber(result._id);
      }
      console.log('getFromNumber', error);
      throw error;
    }
  }
}
