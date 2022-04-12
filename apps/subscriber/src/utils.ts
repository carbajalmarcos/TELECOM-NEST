import { Injectable } from '@nestjs/common';
import { UserNumberDto, NumberService, FromNumberDto } from '@telecom/numbers';
import { rmq, redis } from '@telecom/constants';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class NumberUtils {
  private readonly redis: Redis;

  constructor(
    private readonly numberService: NumberService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }
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
        await this.numberService.findOneNonAssignedFromNumber();
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
      console.log('getNumberForBidirectionalFlow', error);
      return null;
    }
  }

  async getNumberForUnidirectionalFlow(): Promise<string> {
    try {
      const result = await this.getFromNumber();
      return result.number;
    } catch (error) {
      console.log('getNumberForUnidirectionalFlow', error);
      return null;
    }
  }

  private async getLockerNumbers(): Promise<Array<string>> {
    const result = await this.redis.lrange(redis.LOCKER_KEY, 0, -1);
    console.log('getLockerNumbers :: ', result);
    return result;
  }

  private async saveLockedNumber(value: string): Promise<number> {
    const result = await this.redis.lpush(redis.LOCKER_KEY, value);
    console.log('saveLockedNumber :: ', result);
    // const result = JSON.stringify(await this.redis.get(key));
    return result;
  }

  private async removeLockedNumber(value: string): Promise<number> {
    const result = await this.redis.lrem(redis.LOCKER_KEY, 0, value);
    console.log('removeLockedNumber :: ', result);
    return result;
  }

  async getFromNumber(): Promise<FromNumberDto> {
    const from = new Date();
    from.setMinutes(from.getMinutes() - 1);
    console.log('START REDIS LOCKER');
    // get all locker numbers from redis
    const lockedNumbers = await this.getLockerNumbers();
    const result = await this.numberService.findOneUserNumberRoundRobin(
      from,
      rmq.SPAM_LIMIT,
      lockedNumbers ?? [],
    );
    // save locker number to redis
    await this.saveLockedNumber(result.number);
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
    // remove locker number from redis (set free number)
    await this.removeLockedNumber(result.number);
    console.log('END REDIS LOCKER');
    return updateResult;
  }
}
