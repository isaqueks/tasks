import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(18)
  cnpj?: string;
}

