import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate, IsArray,
  IsEnum
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { Job, JobStatusEnum } from '../domain/job';
import { User } from '../../users/domain/user';

export class FilterJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableTimes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;



  @ApiPropertyOptional({
    enum: ['online', 'offline', 'both']
  })
  @IsOptional()
  @IsString()
  locationType?: string;



  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => User)
  postedBy?: User;



  @ApiPropertyOptional({
    enum: JobStatusEnum
  })
  @IsOptional()
  @IsEnum(JobStatusEnum)
  status?: JobStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}

export class SortJobDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Job;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryJobDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterJobDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterJobDto)
  filters?: FilterJobDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortJobDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortJobDto)
  sort?: SortJobDto[] | null;
}
