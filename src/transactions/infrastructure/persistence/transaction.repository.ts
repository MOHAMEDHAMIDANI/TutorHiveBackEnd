import { User } from 'src/users/domain/user';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Transaction } from '../../domain/transaction';
import { Status } from '../../../statuses/domain/status';

import { FilterTransactionDto, SortTransactionDto } from '../../dto/query-transaction.dto';

export abstract class TransactionRepository {
  abstract create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Transaction>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTransactionDto | null;
    sortOptions?: SortTransactionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Transaction[]>;

  abstract findById(id: Transaction['id']): Promise<NullableType<Transaction>>;

  abstract findByUser(user: User['id']): Promise<NullableType<Transaction>>;

  abstract update(
    id: Transaction['id'],
    payload: Partial<
      Pick<
        Transaction,
        | 'title'
        | 'amount'
        | 'user'
        | 'status'
      >
    >,
  ): Promise<Transaction>;

  abstract remove(id: Transaction['id']): Promise<void>;

  abstract getTotalBalance(user: User['id']): Promise<number>;

  abstract deductCredits(userId: number, amount: number, type: string): Promise<void>;

  abstract addCredits(userId: number, amount: number, type: string): Promise<void>;
}
