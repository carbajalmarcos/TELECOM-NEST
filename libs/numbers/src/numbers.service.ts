import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FromNumber, FromNumberDocument } from './schemas/from-number.schema';
import { UserNumber, UserNumberDocument } from './schemas/user-number.schema';
import { FromNumberDto } from './dto/fromNumber.dto';
import { UserNumberDto } from './dto/userNumber.dto';
import mongoose from 'mongoose';
import { SearchFromNumberDto } from './dto/searchFromNumber.dto';
import { SearchUserNumberDto } from './dto/searchUserNumber.dto';
import { rmq } from '@telecom/constants';
import { string } from 'yargs';

@Injectable()
export class NumberService {
  constructor(
    @InjectModel(FromNumber.name)
    private readonly numberModel: Model<FromNumberDocument>,
    @InjectModel(UserNumber.name)
    private readonly userNumberModel: Model<UserNumberDocument>,
  ) {}

  async findOneFromNumberById(
    id: mongoose.Types.ObjectId,
  ): Promise<FromNumber> {
    return await this.numberModel.findById(id).exec();
  }

  async findOneFromNumber(
    searchFromNumberDto: SearchFromNumberDto,
  ): Promise<FromNumber> {
    return await this.numberModel.findOne(searchFromNumberDto).exec();
  }

  async findOneNonAssignedFromNumber(): Promise<FromNumber> {
    return await this.numberModel
      .findOne({
        $and: [
          {
            $or: [{ userAssigned: { $exists: false } }, { userAssigned: null }],
          },
          { sentCount: 0 },
        ],
      })
      .exec();
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
    id: mongoose.Types.ObjectId,
    fromNumberDto: FromNumberDto,
  ): Promise<FromNumber> {
    return await this.numberModel
      .findByIdAndUpdate(id, { ...fromNumberDto })
      .exec();
  }

  async deleteFromNumber(id: string): Promise<FromNumber> {
    return await this.numberModel.findByIdAndDelete(id).exec();
  }

  async findOneUserNumberById(id: string): Promise<UserNumber> {
    return await this.userNumberModel.findById(id).exec();
  }

  async findOneUserNumber(
    searchUserNumberDto: SearchUserNumberDto,
  ): Promise<UserNumber> {
    return await this.userNumberModel.findOne(searchUserNumberDto).exec();
  }

  async findOneUserNumberRoundRobin(
    ltNumberUpdateAt: Date,
    spamCount = rmq.SPAM_LIMIT,
    lockerNumbers: Array<string>,
  ): Promise<FromNumber> {
    return await this.numberModel
      .findOne(
        {
          $and: [
            {
              $or: [
                {
                  userAssigned: {
                    $exists: false,
                  },
                },
                {
                  userAssigned: null,
                },
              ],
            },
            {
              number: { $nin: lockerNumbers },
            },
            {
              $or: [
                {
                  $or: [
                    {
                      updateAt: {
                        $exists: false,
                      },
                    },
                    {
                      updateAt: null,
                    },
                    {
                      updateAt: {
                        $lt: ltNumberUpdateAt,
                      },
                    },
                  ],
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
        null,
        {
          sort: { updateAt: -1 },
        },
      )
      .exec();
  }

  async createUserNumber(
    createUserNumberDto: UserNumberDto,
  ): Promise<UserNumber> {
    return await new this.userNumberModel({
      ...createUserNumberDto,
    }).save();
  }

  async updateUserNumber(
    id: string,
    updateUserNumberDto: UserNumberDto,
  ): Promise<UserNumber> {
    return await this.userNumberModel
      .findByIdAndUpdate(id, updateUserNumberDto)
      .exec();
  }

  async deleteNumber(id: string): Promise<UserNumber> {
    return await this.userNumberModel.findByIdAndDelete(id).exec();
  }
}
