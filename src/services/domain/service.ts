import { IsOptional } from 'class-validator';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Review } from 'src/reviews/domain/review';

const idType = Number;

export class Service {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'Professional Web Development',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'path/to/image.jpg',
  })
  image: string;

  @ApiProperty({
    type: String,
    example: 'Full stack web development services using modern technologies',
  })
  description: string;

  @ApiProperty({
    type: Number,
    example: 99.99,
  })
  price: number;

  @ApiProperty({
    type: () => User,
  })
  user: User;

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

  @ApiProperty({
    type: () => [Review],
  })
  reviews?: Review[];

  @ApiProperty({
    description: 'Academic subjects covered by this service',
    example: ['Mathematics', 'Physics', 'Computer Science'],
    isArray: true,
    type: String
  })
  subjects: string[];

  @ApiProperty({
    description: 'Grade levels this service is appropriate for',
    example: ['High School', 'University', 'Graduate'],
    isArray: true,
    type: String
  })
  gradeLevels: string[];



  @ApiProperty({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  locationType: 'online' | 'offline' | 'both';
}
