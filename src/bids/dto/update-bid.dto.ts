import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBidDto } from './create-bid.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Min } from 'class-validator';
import { User } from '../../users/domain/user';
import { Job } from '../../jobs/domain/job';

export enum BidStatusEnum {
  pending = 'pending',
  accepted = 'accepted', 
  rejected = 'rejected',
  cancelled = 'cancelled'
}

export class UpdateBidDto extends PartialType(CreateBidDto) {
  @ApiPropertyOptional({
    type: Number,
    description: 'Proposed price for tutoring',
    minimum: 0
  })
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    type: () => Job,
    description: 'The job being bid on'
  })
  @IsOptional()
  @Type(() => Job)
  job?: Job;

  @ApiPropertyOptional({
    type: () => User,
    description: 'The tutor making the bid'
  })
  @IsOptional()
  @Type(() => User)
  tutor?: User;

  @ApiPropertyOptional({
    type: String,
    enum: BidStatusEnum,
    description: 'Status of the bid',
    example: BidStatusEnum.pending
  })
  @IsOptional()
  status?: BidStatusEnum;

  @ApiPropertyOptional({
    type: String,
    description: 'Tutor\'s proposal or message for the job'
  })
  @IsOptional()
  @IsString()
  proposal?: string;
}
