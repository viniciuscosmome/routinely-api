import { Request } from 'express';
import {
  Controller,
  Body,
  Post,
  Put,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  CreateAccountControllerInput,
  AccessAccountControllerInput,
  RefreshSessionControllerInput,
  ResetPasswordInput,
  ChangePasswordInput,
  ValidateTokenInput,
} from './account.dtos';
import { AccountService } from './account.service';
import { SessionService } from '../Session/session.service';
import { CREDENTIALS_KEY } from 'src/config/constants';

@UseGuards(ThrottlerGuard)
@Controller('auth')
@ApiTags('Authentication')
export class AccountController {
  constructor(
    private accountService: AccountService,
    private sessionService: SessionService
  ) {}

  @Post()
  @HttpCode(200)
  async access(
    @Body() { email, password, remember }: AccessAccountControllerInput
  ) {
    const accountData = await this.accountService.accessAccount({
      email,
      password,
    });

    const sessionData = this.sessionService.createSession({
      accountId: accountData.id,
      permissions: accountData.permissions,
      name: accountData.name,
      remember,
    });

    return sessionData;
  }

  @Post('register')
  async create(
    @Body()
    { name, email, password, acceptedTerms }: CreateAccountControllerInput
  ) {
    const { message } = await this.accountService.createAccount({
      name,
      email,
      password,
      acceptedTerms,
    });

    return {
      message,
    };
  }

  @ApiBearerAuth('refresh')
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() { refreshToken }: RefreshSessionControllerInput,
    @Req() request: Request
  ) {
    const { sessionToken } = request[CREDENTIALS_KEY];

    const newSession =
      await this.sessionService.findExpiredSessionByTokenAndRefreshToken(
        sessionToken,
        refreshToken
      );

    return newSession;
  }

  @Post('resetpassword')
  async resetPassword(@Body() resetPasswordInput: ResetPasswordInput) {
    try {
      return await this.accountService.resetPassword(resetPasswordInput);
    } catch (e) {
      throw e;
    }
  }

  @Post('validatecode')
  async validateCode(@Body() validateTokenInput: ValidateTokenInput) {
    try {
      await this.accountService.validateCode(validateTokenInput);
      return { message: 'Validação bem-sucedida!' };
    } catch (e) {
      throw e;
    }
  }

  @Put('changepassword')
  async changePassword(@Body() changePasswordInput: ChangePasswordInput) {
    try {
      await this.accountService.changePassword(changePasswordInput);
      return { message: 'Senha alterada com sucesso' };
    } catch (e) {
      throw e;
    }
  }
}
