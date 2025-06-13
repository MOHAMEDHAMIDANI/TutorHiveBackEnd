import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { User } from '../domain/user';
import { RoleDto } from '../../roles/dto/role.dto';
import { Review } from '../../reviews/domain/review';

export class FilterUserDto {
  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  roles?: RoleDto[] | null;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  tags?: string[] | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  subjects?: string[] | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  gradeLevels?: string[] | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  availableDays?: string[] | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional() 
  unavailableDates?: string[] | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional() 
  search?: string | null;
  @ApiPropertyOptional({ type: Number })
  @IsOptional() 
  hourlyRate?: number | null;
  

  
  

  @ApiPropertyOptional({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  locationType?: 'online' | 'offline' | 'both';

  @ApiPropertyOptional({ 
    type: Number,
    description: 'Filter users by minimum average rating',
    minimum: 0,
    maximum: 5 
  })
  @IsOptional()
  @IsNumber()
  rating?: number | null;

  @ApiPropertyOptional({ 
    type: Boolean,
    description: 'Filter users who have reviews' 
  })
  @IsOptional()
  hasReviews?: boolean | null;
}

export class SortUserDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof User;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryUserDto {
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

  @ApiPropertyOptional({ example: '923009550284', type: Number })
  @IsPhoneNumber()
  @IsOptional()
  phone: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterUserDto)
  filters?: FilterUserDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortUserDto)
  sort?: SortUserDto[] | null;
}
