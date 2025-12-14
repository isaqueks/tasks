import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsBoolean, IsOptional, ValidateIf } from 'class-validator';
import { IsDateString } from 'class-validator';

export class UpdateTaskDto extends PartialType(OmitType(CreateTaskDto, ['date'] as const)) {
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  // Allow date to be null or empty string for backlog
  @ValidateIf((o) => o.date !== null && o.date !== undefined && o.date !== '')
  @IsDateString()
  @IsOptional()
  date?: string | null;
}

