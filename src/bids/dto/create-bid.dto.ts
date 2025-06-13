import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({
    type: Number,
    description: 'Proposed price for tutoring',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    type: () => Number,
    description: 'ID of the post being bid on'
  })
  @IsNumber()
  jobId: number;

  @ApiProperty({
    type: String,
    description: 'Tutor\'s proposal or message for the job'
  })
  @IsString()
  proposal: string;
}
