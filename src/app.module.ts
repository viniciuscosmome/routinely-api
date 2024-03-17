import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { throttlerConfig } from './config/throttler';
import { AccountModule, TaskModule, GoalModule } from './modules';
import PrismaModule from './libs/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfiguration } from './libs/jwt/jwt.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot(throttlerConfig),
    JwtModule.registerAsync(jwtConfiguration),
    PrismaModule,
    AccountModule,
    TaskModule,
    GoalModule,
  ],
})
export class AppModule {}
