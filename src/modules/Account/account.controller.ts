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
  async access(@Body() input: AccessAccountControllerInput) {
    const session = await this.accountService.accessAccount({
      email: input.email,
      password: input.password,
      remember: input.remember,
    });

    return {
      message: 'Conectado!',
      data: session,
    };
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

  @Post('refresh')
  @HttpCode(200)
  @ApiBearerAuth('refresh')
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
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordInput: ResetPasswordInput) {
    try {
      return await this.accountService.resetPassword(resetPasswordInput);
    } catch (e) {
      throw e;
    }
  }

  @Post('validatecode')
  @HttpCode(200)
  async validateCode(@Body() validateTokenInput: ValidateTokenInput) {
    try {
      await this.accountService.validateCode(validateTokenInput);
      return { message: 'Validação bem-sucedida!' };
    } catch (e) {
      throw e;
    }
  }

  @Put('changepassword')
  @HttpCode(200)
  async changePassword(@Body() changePasswordInput: ChangePasswordInput) {
    try {
      await this.accountService.changePassword(changePasswordInput);
      return { message: 'Senha alterada com sucesso' };
    } catch (e) {
      throw e;
    }
  }
}
