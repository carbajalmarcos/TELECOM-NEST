import { Injectable } from '@nestjs/common';
import { UserNumberDto } from '@telecom/numbers';
import { NumberService } from '@telecom/numbers';

@Injectable()
export class NumberUtils {
  constructor(private readonly numberService: NumberService) {}

  /**
   * get the origin number
   * @param  {String} user name
   */
  async getNumber(user: string): Promise<string> {
    try {
      const userNumberResult = await this.numberService.findOneUserNumber({
        user,
      });
      // it checks if  user has assigned number
      if (userNumberResult) {
        const fromNumberResult = await this.numberService.findOneFromNumberById(
          userNumberResult.currentNumber,
        );
        console.info(
          `Existent from number ::`,
          JSON.stringify(fromNumberResult),
        );
        return fromNumberResult.number;
      }
      // we find one number without assignment
      const fromNumberResult =
        await this.numberService.findOneNonAssignedFromNumber();
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
      console.error(`Get number error ::`, error);
      return null;
    }
  }
}
