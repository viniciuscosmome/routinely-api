import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtConfiguration: JwtModuleAsyncOptions = {
  global: true,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const secret = configService.get<string>('SESSION_SECRET');
    const error = 'env = SESSION_SECRET is required';

    if (!secret) throw new InternalServerErrorException({ message: error });

    return {
      secret: secret,
      global: true,
    };
  },
};
