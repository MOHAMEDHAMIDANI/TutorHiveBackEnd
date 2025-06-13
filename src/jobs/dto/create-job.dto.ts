import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { JobStatusEnum } from '../domain/job';

export class CreateJobDto {
  @ApiProperty({
    type: String,
    description: 'Title of the job',
    example: 'Math Tutoring Session'
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Subject area', 
    example: 'Mathematics'
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    description: 'Grade/education level',
    example: 'University - First Year'
  })
  @IsString()
  gradeLevel: string;

  @ApiProperty({
    type: [String],
    description: 'Available time slots',
    example: ['Monday 2-4pm', 'Wednesday 3-5pm']
  })
  @IsArray()
  @IsString({ each: true })
  availableTimes: string[];

  @ApiProperty({
    type: [String],
    description: 'Tags for the job',
    example: ['calculus', 'derivatives', 'math help']
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    type: String,
    description: 'Detailed description of job',
    example: 'Looking for help understanding derivatives and integrals for upcoming exam'
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: String,
    description: 'URL to uploaded image',
    required: false
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    type: String,
    description: 'Preferred location type',
    example: 'online',
    enum: ['online', 'offline', 'both'],
    default: 'online',
    required: false
  })
  @IsString()
  @IsEnum(['online', 'offline', 'both'])
  @IsOptional()
  locationType?: string;

  

  @ApiProperty({
    type: String,
    description: 'Status of the job',
    enum: JobStatusEnum,
    default: JobStatusEnum.new
  })
  @IsEnum(JobStatusEnum)
  @IsOptional()
  status?: JobStatusEnum;
}
