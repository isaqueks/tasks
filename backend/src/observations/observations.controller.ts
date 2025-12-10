import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ObservationsService } from './observations.service';
import { CreateObservationDto } from './dto/create-observation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks/:taskId/observations')
@UseGuards(JwtAuthGuard)
export class ObservationsController {
  constructor(
    private readonly observationsService: ObservationsService,
  ) {}

  @Post()
  create(
    @Param('taskId') taskId: string,
    @Body() createObservationDto: CreateObservationDto,
    @Request() req,
  ) {
    return this.observationsService.create(
      taskId,
      createObservationDto,
      req.user.userId,
    );
  }

  @Get()
  findAll(@Param('taskId') taskId: string, @Request() req) {
    return this.observationsService.findAll(taskId, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.observationsService.remove(id, req.user.userId);
  }
}

