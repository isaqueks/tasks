import { IsString, IsEnum, IsOptional, IsDateString, IsUUID, ValidateIf } from 'class-validator';
import { Priority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  // Só valida como ISO date se não for vazio/null (permite backlog)
  @ValidateIf((o) => o.date !== null && o.date !== undefined && o.date !== '')
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsUUID()
  companyId: string;
}

