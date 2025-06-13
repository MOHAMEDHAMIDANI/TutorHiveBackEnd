import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { StatusDto } from '../../statuses/dto/status.dto';
import { User } from 'src/users/domain/user';
import { Service } from 'src/services/domain/service';

export class CreateTransactionDto {
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for knowledge and expertise (1-5 stars)',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  knowledgeAndExpertise: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for communication skills (1-5 stars)',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  communicationSkills: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for preparedness and organization (1-5 stars)',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  preparednessAndOrganization: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for reliability and punctuality (1-5 stars)',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  reliabilityAndPunctuality: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for professionalism (1-5 stars)',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism: number;

  @ApiProperty({
    type: String,
    description: 'Summary transaction text',
    example: 'Great service, very professional and knowledgeable.',
  })
  @IsString()
  summary: string;

  @ApiProperty({ type: () => Number, description: 'ID of the tutor being transactioned' })
  @IsNumber()
  tutorId: number;

  @ApiProperty({ type: () => Number, required: false })
  @IsNumber()
  @IsOptional()
  serviceId?: number;
}


export class TopUpDto {
  @ApiProperty({ type: String, description: 'Payment method ID' })
  paymentMethodId: string;

  @ApiProperty({ type: Number, description: 'Amount to top up' })
  amount: number;

  
}