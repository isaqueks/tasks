import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Priority } from './entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('companyId') companyId?: string,
    @Query('priority') priority?: Priority,
    @Query('completed') completed?: string,
    @Query('date') date?: string,
  ) {
    return this.tasksService.findAll(req.user.userId, {
      companyId,
      priority,
      completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
      date,
    });
  }

  @Get('weekly')
  findWeekly(@Request() req, @Query('startDate') startDate?: string) {
    return this.tasksService.findWeekly(req.user.userId, startDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.userId);
  }
}

