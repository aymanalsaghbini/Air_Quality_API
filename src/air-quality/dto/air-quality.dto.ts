import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GetAirQualityDataDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  filters?: string;
}
