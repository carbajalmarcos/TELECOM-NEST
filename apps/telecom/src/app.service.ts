import { Injectable } from '@nestjs/common';
import { NumberService, UserNumberDto } from '@telecom/numbers';
import { rmq, utils } from '@telecom/constants';
import { FromNumberDocument } from '@telecom/numbers/schemas/from-number.schema';

@Injectable()
export class AppService {
  constructor(private readonly numberService: NumberService) {}

  async numberRotation(number: string | undefined, user: string) {
    try {
      //will be used in the entire flow
      let numberResult;
      // getting current number from user
      const userNumberResult = await this.numberService.findOneUserNumber({
        user,
      });
      // user doesnt have number assigned
      if (!userNumberResult)
        return {
          message: 'User number not found',
          number,
        };
      // getting new quarantine numbers, if quarantine number is mayor than 120 days
      const quarantineNumbers = userNumberResult.quarantineNumbers.filter(
        (qnumber) => {
          const qdate = new Date(qnumber.updateAt);
          const dateToCompare = new Date();
          dateToCompare.setDate(
            dateToCompare.getDate() - utils.QUARANTINE_NUMBERS_DAYS,
          );
          return qdate > dateToCompare;
        },
      );
      // number exists ?
      if (number) {
        numberResult =
          await this.numberService.findFromNumberByNumberAndNonAssignedWithNumberParam(
            number,
            quarantineNumbers.map((qnumber) => qnumber.number),
          );
        if (!numberResult) {
          return {
            message: 'Number not found',
            number: number,
          };
        }
      }

      // old number asignment
      const olderNumber = (await this.numberService.findOneFromNumberById(
        userNumberResult.currentNumber,
      )) as FromNumberDocument;
      // no number param, lets get number result
      if (!numberResult) {
        //searching unnasigned number
        numberResult =
          await this.numberService.findFromNumberByNumberAndNonAssignedWithoutNumberParam(
            quarantineNumbers.map((qnumber) => qnumber.number),
          );
        // if unnasigned number doesnt  exist the search from round robin
        if (!numberResult) {
          const from = new Date();
          numberResult =
            await this.numberService.findOneUserNumberRoundRobinWhitQuarantineNumber(
              from,
              rmq.SPAM_LIMIT,
              quarantineNumbers.map((qnumber) => qnumber.number),
            );
          if (!numberResult) {
            return {
              message: 'No available number',
            };
          }
        }
      }

      quarantineNumbers.push({ number: olderNumber.id, updateAt: new Date() });
      // updating user number
      const userNumberDto = new UserNumberDto();
      userNumberDto.user = user;
      userNumberDto.currentNumber = numberResult._id;
      userNumberDto.quarantineNumbers = quarantineNumbers;
      const savedUserNumberResult = await this.numberService.updateUserNumber(
        userNumberResult.id,
        userNumberDto,
      );
      const updateFromNumberResult = await this.numberService.updateFromNumber(
        numberResult._id,
        { userAssigned: savedUserNumberResult.id, locked: false },
      );
      console.info(
        'from number updated::',
        JSON.stringify(updateFromNumberResult),
      );
      console.info('olderNumber id ::', olderNumber._id);
      const oldFromNumberUpdated = await this.numberService.updateFromNumber(
        olderNumber._id,
        {
          userAssigned: null,
          locked: false,
          sentCount: 9,
          updateAt: new Date(),
        },
      );
      console.info(
        'old from number updated::',
        JSON.stringify(oldFromNumberUpdated),
      );
      return {
        message: 'Number assigned successfully',
        number: numberResult.number,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'No available number',
      };
    }
  }
}
