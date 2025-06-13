import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate,
  Max,
  Min,
  IsEnum,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { Service } from '../domain/service';
import { User } from '../../users/domain/user';
import { Status } from '../../statuses/domain/status';

export class FilterServiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => User)
  user?: User;

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

  @ApiPropertyOptional({
    description: 'Academic subjects covered by this service',
    example: ['Mathematics', 'Physics', 'Computer Science'],
    isArray: true,
    type: String
  })
  @IsOptional()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    description: 'Grade levels this service is appropriate for',
    example: ['High School', 'University', 'Graduate'],
    isArray: true,
    type: String
  })
  @IsOptional()
  @IsString({ each: true })
  gradeLevels?: string[];

  

  @ApiPropertyOptional({
    description: 'Minimum rating threshold for the service',
    example: 4.5,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minimumRating?: number;

  @ApiPropertyOptional({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  @IsOptional()
  @IsString()
  @IsEnum(['online', 'offline', 'both'])
  locationType?: 'online' | 'offline' | 'both';

}

export class SortServiceDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Service;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryServiceDto {
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
    value ? plainToInstance(FilterServiceDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterServiceDto)
  filters?: FilterServiceDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortServiceDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortServiceDto)
  sort?: SortServiceDto[] | null;
}
