import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { Transaction } from '../../../../domain/transaction';
import { TransactionEntity } from '../entities/transaction.entity';

export class TransactionMapper {
  static toDomain(raw: TransactionEntity): Transaction {
    const domainEntity = new Transaction();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.amount = raw.amount;
    // domainEntity.user = raw.user;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Transaction): TransactionEntity {
    let status: StatusEntity | undefined = undefined;

    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
    }

    const persistenceEntity = new TransactionEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.user) {
      const userEntity = new UserEntity();
      userEntity.id = Number(domainEntity.user.id);
      persistenceEntity.user = userEntity;
    }

    persistenceEntity.title = domainEntity.title;
    persistenceEntity.amount = domainEntity.amount;
    persistenceEntity.status = status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    return persistenceEntity;
  }
}
