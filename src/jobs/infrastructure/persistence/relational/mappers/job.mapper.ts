import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { Job } from '../../../../domain/job';
import { JobEntity } from '../entities/job.entity';

export class JobMapper {
  static toDomain(raw: JobEntity): Job {
    const domainEntity = new Job();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.subject = raw.subject;
    domainEntity.gradeLevel = raw.gradeLevel;
    domainEntity.availableTimes = raw.availableTimes;
    domainEntity.tags = raw.tags;
    domainEntity.description = raw.description;
    domainEntity.image = raw.image;
    domainEntity.locationType = raw.locationType;
    domainEntity.postedBy = raw.postedBy;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Job): JobEntity {
    const persistenceEntity = new JobEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.title = domainEntity.title;
    persistenceEntity.subject = domainEntity.subject;
    persistenceEntity.gradeLevel = domainEntity.gradeLevel;
    persistenceEntity.availableTimes = domainEntity.availableTimes;
    persistenceEntity.tags = domainEntity.tags;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.image = domainEntity.image;
    persistenceEntity.locationType = domainEntity.locationType || 'online';
    if (domainEntity.status) {
      persistenceEntity.status = domainEntity.status;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    if (domainEntity.postedBy) {
      const postedByEntity = new UserEntity();
      postedByEntity.id = Number(domainEntity.postedBy.id);
      persistenceEntity.postedBy = postedByEntity;
    }

    return persistenceEntity;
  }
}
