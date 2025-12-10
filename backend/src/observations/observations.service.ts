import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateObservationDto } from './dto/create-observation.dto';
import { Observation } from './entities/observation.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class ObservationsService {
  constructor(
    @InjectRepository(Observation)
    private observationRepository: Repository<Observation>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(
    taskId: string,
    createObservationDto: CreateObservationDto,
    userId: string,
  ) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['company'],
    });

    if (!task || task.company.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    const observation = this.observationRepository.create({
      ...createObservationDto,
      taskId,
    });
    return this.observationRepository.save(observation);
  }

  async findAll(taskId: string, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['company'],
    });

    if (!task || task.company.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return this.observationRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string) {
    const observation = await this.observationRepository.findOne({
      where: { id },
      relations: ['task', 'task.company'],
    });

    if (!observation || observation.task.company.userId !== userId) {
      throw new NotFoundException('Observation not found');
    }

    await this.observationRepository.remove(observation);
    return { message: 'Observation deleted successfully' };
  }
}

