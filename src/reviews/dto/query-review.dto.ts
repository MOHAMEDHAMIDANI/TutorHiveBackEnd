import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { Review } from '../domain/review';
import { User } from '../../users/domain/user';
import { Status } from '../../statuses/domain/status';
import { Service } from '../../services/domain/service';

export class FilterReviewDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  knowledgeAndExpertise?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communicationSkills?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  preparednessAndOrganization?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  reliabilityAndPunctuality?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => User)
  user?: User;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => User)
  reviewedBy?: User;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Service)
  service?: Service;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Status)
  status?: Status;

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

export class SortReviewDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Review;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryReviewDto {
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
    value ? plainToInstance(FilterReviewDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterReviewDto)
  filters?: FilterReviewDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortReviewDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortReviewDto)
  sort?: SortReviewDto[] | null;
}
