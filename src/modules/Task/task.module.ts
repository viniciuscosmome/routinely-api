import { Module } from '@nestjs/common';
import { SessionModule } from '../Session/session.module';
import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [SessionModule],
  providers: [TaskRepository, TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
