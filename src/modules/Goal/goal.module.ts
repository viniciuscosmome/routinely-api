import { Module } from '@nestjs/common';
import { SessionModule } from '../Session/session.module';
import { GoalService } from './goal.service';
import { GoalRepository } from './goal.repository';
import { GoalController } from './goal.controller';

@Module({
  imports: [SessionModule],
  providers: [GoalService, GoalRepository],
  controllers: [GoalController],
})
export class GoalModule {}
