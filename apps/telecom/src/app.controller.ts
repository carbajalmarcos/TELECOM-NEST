import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Request,
  Req,
  Query,
} from '@nestjs/common';
import { MessageService } from '@telecom/message';
import { JwtAuthGuard, LocalAuthGuard, AuthService } from '@telecom/auth';
import { AppService } from './app.service';
import { NumberService, UserNumberDto } from '@telecom/numbers';

@Controller()
export class AppController {
  constructor(
    private readonly messageService: MessageService,
    private authService: AuthService,
    private appService: AppService,
    private readonly numberService: NumberService,
  ) {}
  // TODO: this method will be place for owner auth system
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/message/:id')
  async getMessageById(@Param() param, @Req() req) {
    const result = await this.messageService.findOneMessage(param.id);
    if (!result || Object.keys(result).length === 0) return {};
    const conversation = await this.messageService.findOneConversation(
      result.conversation,
    );
    if (!conversation || conversation.user.toString() !== req.user.userId)
      return {};
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/message/track-id/:id')
  async getMessageByTrackId(@Param() param, @Req() req) {
    const result = await this.messageService.findMessage({ trackId: param.id });
    if (!result || Object.keys(result).length === 0) return {};
    const conversation = await this.messageService.findOneConversation(
      result.conversation,
    );
    if (!conversation || conversation.user.toString() !== req.user.userId)
      return {};
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/number/rotation')
  async changeAssignedNumber(@Query() param, @Req() req) {
    return await this.appService.numberRotation(
      param.number ?? undefined,
      req.user.userId,
    );
  }
}
