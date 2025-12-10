import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, Priority } from './entities/task.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const company = await this.companyRepository.findOne({
      where: { id: createTaskDto.companyId, userId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      date: createTaskDto.date ? new Date(createTaskDto.date) : null,
    });
    return this.taskRepository.save(task);
  }

  async findAll(userId: string, filters?: {
    companyId?: string;
    priority?: Priority;
    completed?: boolean;
    date?: string;
  }) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.company', 'company')
      .leftJoinAndSelect('task.observations', 'observations')
      .where('company.userId = :userId', { userId })
      .orderBy('task.date', 'ASC')
      .addOrderBy('task.createdAt', 'DESC');

    if (filters?.companyId) {
      query.andWhere('task.companyId = :companyId', {
        companyId: filters.companyId,
      });
    }

    if (filters?.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters?.completed !== undefined) {
      query.andWhere('task.completed = :completed', {
        completed: filters.completed,
      });
    }

    if (filters?.date) {
      const date = new Date(filters.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      query.andWhere('task.date BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    return query.getMany();
  }

  async findWeekly(userId: string, startDate?: string) {
    const start = startDate
      ? new Date(startDate)
      : this.getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const companies = await this.companyRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.company', 'company')
      .leftJoinAndSelect('task.observations', 'observations')
      .where('company.userId = :userId', { userId })
      .andWhere(
        '(task.date BETWEEN :start AND :end OR task.date IS NULL)',
        { start, end },
      )
      .orderBy('task.date', 'ASC')
      .addOrderBy('task.createdAt', 'DESC')
      .getMany();

    const result = companies.map((company) => {
      const companyTasks = tasks.filter(
        (task) => task.companyId === company.id,
      );
      const tasksByDay: Record<string, Task[]> = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
        backlog: [],
      };

      companyTasks.forEach((task) => {
        if (!task.date) {
          tasksByDay.backlog.push(task);
        } else {
          const taskDate = new Date(task.date);
          const dayOfWeek = taskDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
          const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const dayNames = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ];
          if (mondayBasedDay >= 0 && mondayBasedDay <= 6) {
            tasksByDay[dayNames[mondayBasedDay]].push(task);
          }
        }
      });

      return {
        company,
        tasks: tasksByDay,
      };
    });

    return {
      startDate: start,
      endDate: end,
      data: result,
    };
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['company', 'observations'],
    });

    if (!task || task.company.userId !== userId) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);
    Object.assign(task, {
      ...updateTaskDto,
      date: updateTaskDto.date ? new Date(updateTaskDto.date) : task.date,
    });
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const result = new Date(d);
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}

