import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { ServiceEntity } from '../../../../../services/infrastructure/persistence/relational/entities/service.entity';
import { Review } from '../../../../domain/review';
import { ReviewEntity } from '../entities/review.entity';

export class ReviewMapper {
  static toDomain(raw: ReviewEntity): Review {
    const domainEntity = new Review();
    domainEntity.id = raw.id;
    domainEntity.knowledgeAndExpertise = raw.knowledgeAndExpertise;
    domainEntity.communicationSkills = raw.communicationSkills;
    domainEntity.preparednessAndOrganization = raw.preparednessAndOrganization;
    domainEntity.reliabilityAndPunctuality = raw.reliabilityAndPunctuality;
    domainEntity.professionalism = raw.professionalism;
    domainEntity.summary = raw.summary;
    domainEntity.user = raw.user;
    if (raw.service) {
      domainEntity.service = raw.service;
    }
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.reviewedBy = raw.reviewedBy;
    return domainEntity;
  }

  static toPersistence(domainEntity: Review): ReviewEntity {
    let status: StatusEntity | undefined = undefined;

    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
    }

    const persistenceEntity = new ReviewEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.user) {
      const userEntity = new UserEntity();
      userEntity.id = Number(domainEntity.user.id);
      persistenceEntity.user = userEntity;
    }

    if (domainEntity.service) {
      const serviceEntity = new ServiceEntity();
      serviceEntity.id = Number(domainEntity.service.id);
      persistenceEntity.service = serviceEntity;
    }

    persistenceEntity.knowledgeAndExpertise = domainEntity.knowledgeAndExpertise;
    persistenceEntity.communicationSkills = domainEntity.communicationSkills;
    persistenceEntity.preparednessAndOrganization = domainEntity.preparednessAndOrganization;
    persistenceEntity.reliabilityAndPunctuality = domainEntity.reliabilityAndPunctuality;
    persistenceEntity.professionalism = domainEntity.professionalism;
    persistenceEntity.summary = domainEntity.summary;
    persistenceEntity.status = status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    if (domainEntity.reviewedBy) {
      const reviewerEntity = new UserEntity();
      reviewerEntity.id = Number(domainEntity.reviewedBy.id);
      persistenceEntity.reviewedBy = reviewerEntity;
    }

    return persistenceEntity;
  }
}
