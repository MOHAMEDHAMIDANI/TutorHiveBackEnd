import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { IsOptional, IsString, IsArray } from 'class-validator';

import { JobStatusEnum } from '../domain/job';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @ApiPropertyOptional({
    type: String,
    description: 'Title of the job',
    example: 'Math Tutoring Session'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Subject area',
    example: 'Mathematics'
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Grade/education level', 
    example: 'University - First Year'
  })
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Available time slots',
    example: ['Monday 2-4pm', 'Wednesday 3-5pm']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableTimes?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Tags for the job',
    example: ['calculus', 'derivatives', 'math help']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    type: String,
    description: 'Detailed description of job',
    example: 'Looking for help understanding derivatives and integrals for upcoming exam'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'URL to uploaded image',
    required: false
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Preferred location type',
    example: 'online',
    enum: ['online', 'offline', 'both']
  })
  @IsOptional()
  @IsString()
  locationType?: string;



  @ApiPropertyOptional({
    type: String,
    description: 'Status of the job',
    enum: JobStatusEnum
  })
  @IsOptional()
  status?: JobStatusEnum;
}
