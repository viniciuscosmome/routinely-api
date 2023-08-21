import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskInput, UpdateTaskInput } from './task.dtos';

@Injectable()
export class TaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(createTaskInput: CreateTaskInput) {
    return await this.prisma.task.create({
      data: {
        date: createTaskInput.date,
        hour: createTaskInput.hour,
        description: createTaskInput.description,
        name: createTaskInput.name,
        priority: createTaskInput.priority,
        tag: createTaskInput.tag,
        accountId: createTaskInput.accountId,
      },
    });
  }

  async updateById(id: string, updateTaskInput: UpdateTaskInput) {
    return await this.prisma.task.update({
      where: { id: Number(id) },
      data: updateTaskInput,
    });
  }

  async findById(id: string) {
    return await this.prisma.task.findUnique({ where: { id: Number(id) } });
  }
}
