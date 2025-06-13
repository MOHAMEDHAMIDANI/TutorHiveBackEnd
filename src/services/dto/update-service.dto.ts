import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { StatusDto } from '../../statuses/dto/status.dto';
import { User } from '../../users/domain/user';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiPropertyOptional({
    type: String,
    example: 'Professional Web Development'
  })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'path/to/image.jpg'
  })
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Full stack web development services using modern technologies'
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 99.99
  })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    type: () => User
  })
  @IsOptional()
  @Type(() => User)
  user?: User;

  @ApiPropertyOptional({
    type: () => StatusDto
  })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  @ApiPropertyOptional({
    description: 'Academic subjects covered by this service',
    example: ['Mathematics', 'Physics', 'Computer Science'],
    isArray: true,
    type: String
  })
  @IsOptional()
  subjects?: string[];

  @ApiPropertyOptional({
    description: 'Grade levels this service is appropriate for',
    example: ['High School', 'University', 'Graduate'],
    isArray: true,
    type: String
  })
  @IsOptional()
  gradeLevels?: string[];

  @ApiPropertyOptional({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  @IsOptional()
  locationType?: 'online' | 'offline' | 'both';
}
