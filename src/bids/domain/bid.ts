import { IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Job } from '../../jobs/domain/job';

export enum BidStatusEnum {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
  cancelled = 'cancelled'
}

export class Bid {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
    description: 'Proposed price for tutoring',
    minimum: 0
  })
  @Min(0)
  price: number;

  @ApiProperty({
    type: () => Job,
    description: 'The job being bid on'
  })
  job: Job;

  @ApiProperty({
    type: () => User,
    description: 'The tutor making the bid'
  })
  tutor: User;

  @ApiProperty({
    type: String,
    enum: BidStatusEnum,
    description: 'Status of the bid',
    example: BidStatusEnum.pending
  })
  status: BidStatusEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty({
    type: String,
    description: 'Tutor\'s proposal or message for the job',
    example: 'I would love to help you with mathematics. I have 5 years of experience teaching calculus...'
  })
  proposal: string;
}
