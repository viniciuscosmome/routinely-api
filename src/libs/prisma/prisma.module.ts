import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
class PrismaModule {}

export default {
  module: PrismaModule,
  global: true,
};
