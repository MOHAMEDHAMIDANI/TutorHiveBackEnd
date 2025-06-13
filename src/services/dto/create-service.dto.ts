import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { StatusDto } from '../../statuses/dto/status.dto';

export class CreateServiceDto {
  @ApiProperty({
    type: String,
    example: 'Professional Web Development'
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    example: 'path/to/image.jpg'
  })
  @IsString()
  image: string;

  @ApiProperty({
    type: String,
    example: 'Full stack web development services using modern technologies'
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: Number,
    example: 99.99
  })
  @IsNumber()
  price: number;


  @ApiProperty({
    description: 'Academic subjects covered by this service',
    example: ['Mathematics', 'Physics', 'Computer Science'],
    isArray: true,
    type: String
  })
  @IsString({ each: true })
  subjects: string[];

  @ApiProperty({
    description: 'Grade levels this service is appropriate for', 
    example: ['High School', 'University', 'Graduate'],
    isArray: true,
    type: String
  })
  @IsString({ each: true })
  gradeLevels: string[];

  @ApiProperty({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  @IsOptional()
  @IsEnum(['online', 'offline', 'both'])
  locationType: 'online' | 'offline' | 'both';
}
