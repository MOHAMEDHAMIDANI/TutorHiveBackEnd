import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { JobEntity } from '../../../../../jobs/infrastructure/persistence/relational/entities/job.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Min } from 'class-validator';

export enum BidStatusEnum {
  pending = 'pending',
  accepted = 'accepted', 
  rejected = 'rejected',
  cancelled = 'cancelled'
}

@Entity({
  name: 'bid',
})
export class BidEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: Number,
    description: 'Proposed price for tutoring',
    minimum: 0
  })
  @Min(0)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    type: () => JobEntity,
    description: 'The job being bid on'
  })
  @ManyToOne(() => JobEntity, {
    eager: true
  })
  job: JobEntity;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The tutor making the bid'
  })
  @ManyToOne(() => UserEntity)
  tutor: UserEntity;

  @ApiProperty({
    type: String,
    enum: BidStatusEnum,
    description: 'Status of the bid',
    example: BidStatusEnum.pending
  })
  @Column({
    type: 'enum',
    enum: BidStatusEnum,
    default: BidStatusEnum.pending
  })
  status: BidStatusEnum;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty()
  @Column({
    type: 'text',
    nullable: true
  })
  proposal: string;
}
