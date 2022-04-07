import { Injectable } from '@nestjs/common';

// must be a real class/interface representing a user entity

export type User = {
  userId: string;
  username: string;
  password: string;
  priority: string;
  company: string;
  defaultWebHook: string;
  allowMO: boolean;
};

@Injectable()
export class UserService {
  private readonly users = [
    {
      userId: '6245b787142a22bca35d0ace',
      username: 'cero',
      password: 'cero',
      priority: 'normal',
      company: 'company0',
      defaultWebHook: 'http://company1/webhook',
      allowMO: true,
    },
    {
      userId: '6245b9402186948697be71db',
      username: 'uno',
      password: 'uno',
      priority: 'urgent',
      company: 'company1',
      defaultWebHook: 'http://company2/webhook',
      allowMO: true,
    },
    {
      userId: '624e17d51f4e56493ea0cbd4',
      username: 'dos',
      password: 'dos',
      priority: 'normal',
      company: 'company2',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
    {
      userId: '624f1a31e738a18bce74245b',
      username: 'tres',
      password: 'tres',
      priority: 'urgent',
      company: 'company3',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
    {
      userId: '624e2937a5c723b5c73ef0b5',
      username: 'cuatro',
      password: 'cuatro',
      priority: 'urgent',
      company: 'company4',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
    {
      userId: '624f1a41974f4faa5741c7b6',
      username: 'cinco',
      password: 'cinco',
      priority: 'urgent',
      company: 'company4',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
    {
      userId: '624f1a376c446d9c25becb93',
      username: 'seis',
      password: 'seis',
      priority: 'normal',
      company: 'company4',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
    {
      userId: '624f1a565f5af50751c17977',
      username: 'siete',
      password: 'siete',
      priority: 'normal',
      company: 'company4',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
    {
      userId: '624f1a62b12e654cd248bc5f',
      username: 'ocho',
      password: 'ocho',
      priority: 'urgent',
      company: 'company4',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
    {
      userId: '624f1a8149531dc8d236b0f2',
      username: 'nueve',
      password: 'nueve',
      priority: 'urgent',
      company: 'company4',
      defaultWebHook: 'http://company2/webhook',
      allowMO: false,
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
