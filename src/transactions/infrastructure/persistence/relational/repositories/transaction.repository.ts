import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterTransactionDto, SortTransactionDto } from '../../../../dto/query-transaction.dto';
import { Transaction } from '../../../../domain/transaction';

import { TransactionMapper } from '../mappers/transaction.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { TransactionRepository } from '../../transaction.repository';
import { User } from 'src/users/domain/user';

@Injectable()
export class TransactionsRelationalRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
  ) {}

  async create(data: Transaction): Promise<Transaction> {
    const persistenceModel = TransactionMapper.toPersistence(data);
    const newEntity = await this.transactionsRepository.save(
      this.transactionsRepository.create(persistenceModel),
    );
    return TransactionMapper.toDomain(newEntity);
  }

  async getTotalBalance(user: User['id']): Promise<number> {
    const entity = await this.transactionsRepository.find({
      where: { user: { id: Number(user) } },
    });
    return entity.reduce((acc, curr) => acc + parseInt(curr.amount.toString()), 0);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTransactionDto | null;
    sortOptions?: SortTransactionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Transaction[]> {
    const where: FindOptionsWhere<TransactionEntity> = {};

    if (filterOptions) {
      if (filterOptions.title) {
        where.title = Like(`%${filterOptions.title}%`);
      }
      if (filterOptions.amount) {
        where.amount = filterOptions.amount;
      }
      if (filterOptions.user) {
        where.user = { id: Number(filterOptions.user.id) };
      }
      if (filterOptions.status) {
        where.status = { id: Number(filterOptions.status.id) };
      }
      if (filterOptions.createdAt) {
        where.createdAt = filterOptions.createdAt;
      }
      if (filterOptions.updatedAt) {
        where.updatedAt = filterOptions.updatedAt;
      }
      if (filterOptions.deletedAt) {
        where.deletedAt = filterOptions.deletedAt;
      }
    }

    const entities = await this.transactionsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });

    return entities.map((transaction) => TransactionMapper.toDomain(transaction));
  }

  async findByUser(user: User['id']): Promise<NullableType<Transaction>> {
    const entity = await this.transactionsRepository.findOne({
      where: { user: { id: Number(user) } },
    });
    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  async findById(id: Transaction['id']): Promise<NullableType<Transaction>> {
    const entity = await this.transactionsRepository.findOne({
      where: { id: Number(id) },
    });

    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  async update(id: Transaction['id'], payload: Partial<Transaction>): Promise<Transaction> {
    const entity = await this.transactionsRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Transaction not found');
    }

    const updatedEntity = await this.transactionsRepository.save(
      this.transactionsRepository.create(
        TransactionMapper.toPersistence({
          ...TransactionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TransactionMapper.toDomain(updatedEntity);
  }

  async remove(id: Transaction['id']): Promise<void> {
    await this.transactionsRepository.softDelete(id);
  }

  async deductCredits(userId: number, amount: number, type: string): Promise<void> {
    await this.transactionsRepository.insert({
      amount: -amount,
      user: { id: userId },
      title: type,
    });
  }

  async addCredits(userId: number, amount: number, type: string): Promise<void> {
    await this.transactionsRepository.insert({
      amount: amount,
      user: { id: userId },
      title: type,
    });
  }
}
