import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common/';
import {
  AccessAccountControllerInput,
  CreateAccountServiceOutput,
  AccessAccountServiceOutput,
  CreateAccountControllerInput,
  ChangePasswordInput,
  ResetPasswordOutput,
  ResetPasswordInput,
} from './account.dtos';
import { AccountRepository } from './account.repository';
import { RoleLevel } from 'src/guards';
import { PasswordTokenService } from '../PasswordToken/passwordToken.service';
import { MailingService } from '../Mailing/mailing.service';
import {
  AuthorizationError,
  CustomException,
  DataValidationError,
  InternalServerError,
  NotFoundError,
  UnprocessableEntityError,
} from 'src/config/exceptions';
import { VerifyCodeInput } from '../PasswordToken/passwordToken.dtos';

@Injectable()
export class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private tokenService: PasswordTokenService,
    private mailingService: MailingService
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await hash(password, Number(process.env.SALT_ROUNDS));
  }

  private async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await compare(password, hashedPassword);
  }

  async createAccount(
    createAccountInput: CreateAccountControllerInput
  ): Promise<CreateAccountServiceOutput> {
    if (createAccountInput.acceptedTerms !== true) {
      throw new DataValidationError({
        message: 'Por favor, aceite nossos termos de uso',
        property: 'acceptedTerms',
      });
    }

    const alreadyExists = await this.accountRepository.alreadyExists(
      createAccountInput.email
    );

    if (alreadyExists) {
      throw new UnprocessableEntityError({
        property: 'email',
        message: 'O e-mail já existe na base de dados',
      });
    }

    const hashedPassword = await this.hashPassword(createAccountInput.password);
    const created = await this.accountRepository.createAccount({
      email: createAccountInput.email,
      password: hashedPassword,
      permissions: RoleLevel.Standard,
      name: createAccountInput.name,
    });

    if (created) {
      return {
        message: 'Conta criada!',
      };
    }
  }

  async validateCode(verifyCodeInput: VerifyCodeInput) {
    const result = await this.tokenService.verifyToken(verifyCodeInput);
    if (!result) {
      throw new NotFoundError({
        message: 'Código inválido! - Tente novamente com um código diferente',
      });
    }

    return result;
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordInput
  ): Promise<ResetPasswordOutput> {
    const accountExists = await this.accountRepository.alreadyExists(
      resetPasswordInput.email
    );

    if (!accountExists) {
      throw new NotFoundError({ message: 'Conta não encontrada' });
    }

    const account = await this.accountRepository.findAccountByEmail(
      resetPasswordInput.email
    );

    const createdCode = await this.tokenService.create({
      accountId: account.id,
    });

    try {
      await this.mailingService.sendEmail({
        from: process.env.FROM_EMAIL,
        to: resetPasswordInput.email,
        subject: 'Alterar senha Routinely',
        payload: { name: account.name, code: createdCode.code },
        template: 'resetPassword.handlebars',
      });
      return { accountId: account.id };
    } catch (e) {
      throw new InternalServerError({});
    }
  }

  async changePassword(
    changePasswordInput: ChangePasswordInput
  ): Promise<void> {
    const { accountId, password, code } = changePasswordInput;

    const hashedPassword = await this.hashPassword(password);

    const isValid = await this.tokenService.verifyToken({
      code,
      accountId,
    });

    if (!isValid) {
      throw new AuthorizationError({
        message: 'Código inválido',
      });
    }

    await this.accountRepository.changePassword({
      password: hashedPassword,
      accountId,
    });

    await this.tokenService.deleteToken(accountId);
  }

  async accessAccount(
    accountInput: AccessAccountControllerInput
  ): Promise<AccessAccountServiceOutput> {
    const credentialFromDatabase =
      await this.accountRepository.findAccountByEmail(accountInput.email);

    if (!credentialFromDatabase) {
      throw new CustomException('Credenciais inválidas', 401);
    }

    const validatePass = await this.comparePassword(
      accountInput.password,
      credentialFromDatabase.password
    );

    if (!validatePass) {
      throw new CustomException('Credenciais inválidas', 401);
    }

    return {
      id: credentialFromDatabase.id,
      permissions: credentialFromDatabase.permissions,
      name: credentialFromDatabase.name,
    };
  }
}
