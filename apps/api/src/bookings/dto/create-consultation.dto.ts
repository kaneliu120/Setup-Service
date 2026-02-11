import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  source_slug?: string;
}
