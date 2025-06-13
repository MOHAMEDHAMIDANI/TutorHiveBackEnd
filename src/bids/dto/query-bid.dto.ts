import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate,
  IsEnum,
  Min,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { Bid, BidStatusEnum } from '../domain/bid';
import { User } from '../../users/domain/user';

export class FilterBidDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Proposed price for tutoring',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    type: String,
    enum: BidStatusEnum,
    description: 'Status of the bid'
  })
  @IsOptional()
  @IsEnum(BidStatusEnum)
  status?: BidStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => User)
  tutor?: User;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proposal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  jobId?: number;

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

export class SortBidDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Bid;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryBidDto {
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
    value ? plainToInstance(FilterBidDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterBidDto)
  filters?: FilterBidDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortBidDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortBidDto)
  sort?: SortBidDto[] | null;
}
