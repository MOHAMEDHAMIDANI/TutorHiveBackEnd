import { IsOptional, Min, Max } from 'class-validator';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Service } from 'src/services/domain/service';
import { StatusEnum } from 'src/statuses/statuses.enum';

export enum JobStatusEnum {
  new = 'new',
  active = 'active', 
  closed = 'closed'
}

export class Job {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'Title of the job',
    example: 'Math Tutoring Session'
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Subject area',
    example: 'Mathematics'  
  })
  subject: string;

  @ApiProperty({
    type: String,
    description: 'Grade/education level',
    example: 'University - First Year'
  })
  gradeLevel: string;

  @ApiProperty({
    type: [String],
    description: 'Available time slots',
    example: ['Monday 2-4pm', 'Wednesday 3-5pm']
  })
  availableTimes: string[];

  @ApiProperty({
    type: [String],
    description: 'Tags for the job',
    example: ['calculus', 'derivatives', 'math help']
  })
  tags: string[];

  @ApiProperty({
    type: String,
    description: 'Detailed description of job',
    example: 'Looking for help understanding derivatives and integrals for upcoming exam'
  })
  description: string;

  @ApiProperty({
    type: String,
    description: 'URL to uploaded image',
    required: false
  })
  @IsOptional()
  image?: string;

  @ApiProperty({
    type: String,
    description: 'Preferred location type',
    example: 'online',
    enum: ['online', 'offline', 'both']
  })
  @IsOptional()
  locationType?: string;

  @ApiProperty({
    type: () => User,
    description: 'The user who received the job'
  })
  postedBy: User;

  

  @ApiProperty({
    type: () => Service,
    required: false
  })
  @IsOptional()
  service?: Service;

  @ApiProperty({
    type: String,
    description: 'Status of the job',
    enum: JobStatusEnum
  })
  status?: JobStatusEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

}
