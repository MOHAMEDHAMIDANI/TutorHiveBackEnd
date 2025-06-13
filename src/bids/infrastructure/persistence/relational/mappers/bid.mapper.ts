import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { Bid, BidStatusEnum } from '../../../../domain/bid';
import { BidEntity } from '../entities/bid.entity';
import { JobEntity } from 'src/jobs/infrastructure/persistence/relational/entities/job.entity';

export class BidMapper {
  static toDomain(raw: BidEntity): Bid {
    const domainEntity = new Bid();
    domainEntity.id = raw.id;
    domainEntity.price = raw.price;
    domainEntity.job = raw.job;
    domainEntity.tutor = raw.tutor;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.proposal = raw.proposal;
    return domainEntity;
  }

  static toPersistence(domainEntity: Bid): BidEntity {
    const persistenceEntity = new BidEntity();
    
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.tutor) {
      const tutorEntity = new UserEntity();
      tutorEntity.id = Number(domainEntity.tutor.id);
      persistenceEntity.tutor = tutorEntity;
    }

    if (domainEntity.job) {
      const jobEntity = new JobEntity();
      jobEntity.id = Number(domainEntity.job.id);
      persistenceEntity.job = jobEntity;
    }

    if (domainEntity.price) {
      persistenceEntity.price = domainEntity.price;
    }

    if (domainEntity.status) {
      persistenceEntity.status = domainEntity.status;
    }

    if (domainEntity.createdAt) {
      persistenceEntity.createdAt = domainEntity.createdAt;
    }

    if (domainEntity.updatedAt) {
      persistenceEntity.updatedAt = domainEntity.updatedAt;
    }

    if (domainEntity.deletedAt) {
      persistenceEntity.deletedAt = domainEntity.deletedAt;
    }

    if (domainEntity.proposal) {
      persistenceEntity.proposal = domainEntity.proposal;
    }

    return persistenceEntity;
  }
}
