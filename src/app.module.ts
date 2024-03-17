import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { throttlerConfig } from './config/throttler';
import { AccountModule, TaskModule, GoalModule } from './modules';
import PrismaModule from './libs/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot(throttlerConfig),
    PrismaModule,
    AccountModule,
    TaskModule,
    GoalModule,
  ],
})
export class AppModule {}
