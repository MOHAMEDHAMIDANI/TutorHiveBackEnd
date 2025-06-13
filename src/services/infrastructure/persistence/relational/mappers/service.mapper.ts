import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { Service } from '../../../../domain/service';
import { ServiceEntity } from '../entities/service.entity';

export class ServiceMapper {
  static toDomain(raw: ServiceEntity): Service {
    const domainEntity = new Service();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.image = raw.image;
    domainEntity.description = raw.description;
    domainEntity.price = raw.price;
    domainEntity.user = raw.user;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.subjects = raw.subjects;
    domainEntity.gradeLevels = raw.gradeLevels;
    domainEntity.locationType = raw.locationType;
    domainEntity.deletedAt = raw.deletedAt;
    console.log("raw data", raw);
    domainEntity.reviews = raw.reviews;
    return domainEntity;
  }

  static toPersistence(domainEntity: Service): ServiceEntity {
    let status: StatusEntity | undefined = undefined;

    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
    }

    const persistenceEntity = new ServiceEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.user) {
      const userEntity = new UserEntity();
      userEntity.id = Number(domainEntity.user.id);
      persistenceEntity.user = userEntity;
    }

    persistenceEntity.title = domainEntity.title;
    persistenceEntity.image = domainEntity.image;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.price = domainEntity.price;
    persistenceEntity.status = status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    persistenceEntity.subjects = domainEntity.subjects;
    persistenceEntity.gradeLevels = domainEntity.gradeLevels;
    persistenceEntity.locationType = domainEntity.locationType;
    return persistenceEntity;
  }
}
