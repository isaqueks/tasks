import { IsString, IsNotEmpty } from 'class-validator';

export class CreateObservationDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

