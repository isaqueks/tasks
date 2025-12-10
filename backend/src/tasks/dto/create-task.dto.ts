import { IsString, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { Priority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsUUID()
  companyId: string;
}

