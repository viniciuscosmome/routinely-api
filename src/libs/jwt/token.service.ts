import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  private env: string;

  constructor(
    readonly configService: ConfigService,
    readonly jwtService: JwtService
  ) {
    this.env = this.configService.get<string>('NODE_ENV');
  }

  async access(payload: object, remember: boolean) {
    const config: JwtSignOptions = {
      subject: 'access',
    };

    switch (this.env) {
      case 'production':
        config.expiresIn = remember ? '7d' : '1h';
        break;
      case 'homologation':
        config.expiresIn = remember ? '5m' : '1m';
        break;
      default:
        config.expiresIn = remember ? '1m' : '10s';
    }

    const token = await this.jwtService.signAsync(payload, config);

    return token;
  }

  async refresh(payload: object, remember: boolean) {
    const config: JwtSignOptions = {
      subject: 'refresh',
    };

    switch (this.env) {
      case 'production':
        config.expiresIn = remember ? '7d' : '1h';
        config.notBefore = remember ? '7d' : '1h';
        break;
      case 'homologation':
        config.expiresIn = remember ? '30m' : '10m';
        config.notBefore = remember ? '5m' : '1m';
        break;
      default:
        config.expiresIn = remember ? '5m' : '3m';
        config.notBefore = remember ? '1m' : '10s';
    }

    const token = await this.jwtService.signAsync(payload, config);

    return token;
  }
}
