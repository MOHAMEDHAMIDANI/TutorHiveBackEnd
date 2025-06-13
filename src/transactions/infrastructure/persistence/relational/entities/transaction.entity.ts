import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'transaction',
})
export class TransactionEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    description: 'Title/description of the transaction',
    example: 'Points credited for completing lesson',
  })
  @Column({ type: String, nullable: false })
  title: string;

  @ApiProperty({
    type: Number,
    description: 'Amount of points credited/debited (positive for credit, negative for debit)',
    example: 50,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The user whose points are being modified',
  })
  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  user: UserEntity;

  @ApiProperty({
    type: () => StatusEntity,
    description: 'The status of the transaction',
  })
  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @ApiProperty({
    type: Date,
    description: 'When the transaction occurred',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    type: Date,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
