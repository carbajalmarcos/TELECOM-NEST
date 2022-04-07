import { Injectable } from '@nestjs/common';
import { UserService } from '@telecom/user';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (user && user.password === pass) {
      return {
        username: user.username,
        userId: user.userId,
      };
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      userId: user.userId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
