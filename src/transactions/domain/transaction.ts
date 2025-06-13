import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Status } from '../../statuses/domain/status';

const idType = Number;

export class Transaction {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    description: 'Title/description of the transaction',
    example: 'Points credited for completing lesson',
  })
  title: string;

  @ApiProperty({
    type: Number,
    description: 'Amount of points credited/debited (positive for credit, negative for debit)',
    example: 50,
  })
  amount: number;

  @ApiProperty({
    type: () => User,
    description: 'The user whose points are being modified',
  })
  user: User;

  @ApiProperty({
    type: () => Status,
    description: 'The status of the transaction',
  })
  status?: Status;

  @ApiProperty({
    type: Date,
    description: 'When the transaction occurred',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
  })
  deletedAt: Date;
}
