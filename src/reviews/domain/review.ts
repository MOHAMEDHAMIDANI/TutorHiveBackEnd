import { IsOptional, Min, Max } from 'class-validator';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Service } from 'src/services/domain/service';

export class Review {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for knowledge and expertise (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  knowledgeAndExpertise: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for communication skills (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  communicationSkills: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for preparedness and organization (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  preparednessAndOrganization: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for reliability and punctuality (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  reliabilityAndPunctuality: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for professionalism (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  professionalism: number;

  @ApiProperty({
    type: String,
    description: 'Summary review text',
    example: 'Great service, very professional and knowledgeable.',
  })
  summary: string;

  @ApiProperty({
    type: () => User,
    description: 'The user who received the review'
  })
  user: User;

  @ApiProperty({
    type: () => User,
    description: 'The user who posted the review',
  })
  reviewedBy: User;

  @ApiProperty({
    type: () => Service,
    required: false
  })
  service?: Service;

  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
