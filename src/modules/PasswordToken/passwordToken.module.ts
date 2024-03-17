import { Module } from '@nestjs/common';
import { PasswordTokenRepository } from './passwordToken.repository';
import { PasswordTokenService } from './passwordToken.service';

@Module({
  providers: [PasswordTokenService, PasswordTokenRepository],
  exports: [PasswordTokenService],
})
export class PasswordTokenModule {}
