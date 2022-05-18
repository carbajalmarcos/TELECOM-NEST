import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FromNumber, FromNumberDocument } from './schemas/from-number.schema';
import { UserNumber, UserNumberDocument } from './schemas/user-number.schema';
import { FromNumberDto } from './dto/fromNumber.dto';
import { UserNumberDto } from './dto/userNumber.dto';
import { Types } from 'mongoose';
import { SearchFromNumberDto } from './dto/searchFromNumber.dto';
import { SearchUserNumberDto } from './dto/searchUserNumber.dto';
import { rmq } from '@telecom/constants';

@Injectable()
export class NumberService {
  constructor(
    @InjectModel(FromNumber.name)
    private readonly numberModel: Model<FromNumberDocument>,
    @InjectModel(UserNumber.name)
    private readonly userNumberModel: Model<UserNumberDocument>,
  ) {}

  async findOneFromNumberById(id: Types.ObjectId): Promise<FromNumber> {
    return await this.numberModel.findById(id).exec();
  }

  async findOneFromNumber(
    searchFromNumberDto: SearchFromNumberDto,
  ): Promise<FromNumber> {
    return await this.numberModel.findOne(searchFromNumberDto).exec();
  }

  async findOneNonAssignedFromNumber(): Promise<FromNumber> {
    return await this.numberModel
      .findOneAndUpdate(
        {
          $and: [
            {
              $or: [
                { userAssigned: { $exists: false } },
                { userAssigned: null },
              ],
            },
            { sentCount: 0 },
          ],
        },
        {
          locked: true,
        },
        {
          sort: { updateAt: 1 },
        },
      )
      .lean();
  }

  async findOneNonAssignedFromNumberForRotation(
    quarantineNumbers: Types.ObjectId[],
  ): Promise<FromNumber> {
    return await this.numberModel
      .findOneAndUpdate(
        {
          $and: [
            {
              $or: [
                { userAssigned: { $exists: false } },
                { userAssigned: null },
              ],
            },
            { sentCount: 0 },
            { _id: { $nin: quarantineNumbers } },
          ],
        },
        {
          locked: true,
        },
        {
          sort: { updateAt: 1 },
        },
      )
      .lean();
  }

  async createFromNumber(
    searchFromNumberDto: SearchFromNumberDto,
  ): Promise<FromNumber> {
    const exists = await this.findOneFromNumber(searchFromNumberDto);
    if (exists) return exists;
    return await new this.numberModel({
      ...searchFromNumberDto,
    }).save();
  }

  async updateFromNumber(
    id: Types.ObjectId,
    fromNumberDto: FromNumberDto,
  ): Promise<FromNumber> {
    return await this.numberModel
      .findByIdAndUpdate(id, { ...fromNumberDto })
      .exec();
  }

  async deleteFromNumber(id: string): Promise<FromNumber> {
    return await this.numberModel.findByIdAndDelete(id).lean();
  }

  async findOneUserNumberById(id: string): Promise<UserNumber> {
    return await this.userNumberModel.findById(id).exec();
  }

  async findOneUserNumber(
    searchUserNumberDto: SearchUserNumberDto,
  ): Promise<UserNumber> {
    const result = await this.userNumberModel
      .findOne(searchUserNumberDto)
      .exec();
    return result;
  }

  async findFromNumberByNumberAndNonAssignedWithNumberParam(
    number: string,
    quarantineNumbers: Types.ObjectId[],
  ): Promise<FromNumber> {
    return await this.numberModel
      .findOneAndUpdate(
        {
          $and: [
            {
              $or: [
                { userAssigned: { $exists: false } },
                { userAssigned: null },
              ],
            },
            { number },
            { _id: { $nin: quarantineNumbers } },
          ],
        },
        {
          locked: true,
        },
        {
          sort: { updateAt: 1 },
        },
      )
      .lean();
  }

  async findFromNumberByNumberAndNonAssignedWithoutNumberParam(
    quarantineNumbers: Types.ObjectId[],
  ): Promise<FromNumber> {
    return await this.numberModel
      .findOneAndUpdate(
        {
          $and: [
            {
              $or: [
                { userAssigned: { $exists: false } },
                { userAssigned: null },
              ],
            },
            { _id: { $nin: quarantineNumbers } },
          ],
        },
        {
          locked: true,
        },
        {
          sort: { updateAt: 1 },
        },
      )
      .lean();
  }

  async findOneUserNumberRoundRobin(
    ltNumberUpdateAt: Date,
    spamCount = rmq.SPAM_LIMIT,
  ): Promise<FromNumber> {
    return await this.numberModel
      .findOneAndUpdate(
        {
          $or: [
            {
              $and: [
                {
                  userAssigned: null,
                },
                { sentCount: { $in: [0] } },
                { locked: false },
                { updateAt: null },
              ],
            },
            {
              $and: [
                {
                  locked: false,
                },
                {
                  userAssigned: null,
                },
                {
                  $or: [
                    {
                      updateAt: {
                        $lt: ltNumberUpdateAt,
                      },
                    },
                    {
                      sentCount: {
                        $lt: spamCount,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          locked: true,
        },
        {
          sort: { updateAt: 1 },
        },
      )
      .lean();
  }

  async findOneUserNumberRoundRobinWhitQuarantineNumber(
    ltNumberUpdateAt: Date,
    spamCount = rmq.SPAM_LIMIT,
    quarantineNumbers: Types.ObjectId[],
  ): Promise<FromNumber> {
    return await this.numberModel
      .findOneAndUpdate(
        {
          $and: [
            {
              $and: [
                {
                  userAssigned: null,
                },
                { locked: false },
                { _id: { $nin: quarantineNumbers } },
              ],
            },
            {
              $and: [
                {
                  $or: [
                    {
                      updateAt: {
                        $lt: ltNumberUpdateAt,
                      },
                    },
                    {
                      sentCount: {
                        $lt: spamCount,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          locked: true,
        },
        {
          sort: { updateAt: 1 },
        },
      )
      .lean();
  }

  async unlockNumber(id: Types.ObjectId): Promise<FromNumber> {
    return await this.numberModel
      .findByIdAndUpdate(id, {
        locked: false,
      })
      .lean();
  }

  async createUserNumber(
    createUserNumberDto: UserNumberDto,
  ): Promise<UserNumber> {
    return await new this.userNumberModel({
      ...createUserNumberDto,
    }).save();
  }

  async updateUserNumber(
    id: Types.ObjectId,
    updateUserNumberDto: UserNumberDto,
  ): Promise<UserNumber> {
    return await this.userNumberModel
      .findByIdAndUpdate(id, { ...updateUserNumberDto })
      .exec();
  }

  async deleteNumber(id: string): Promise<UserNumber> {
    return await this.userNumberModel.findByIdAndDelete(id).exec();
  }
}
