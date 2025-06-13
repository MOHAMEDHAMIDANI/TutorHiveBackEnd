import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterTransactionDto, SortTransactionDto } from './dto/query-transaction.dto';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { Transaction } from './domain/transaction';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionRepository,
    private readonly usersService: UsersService
  ) {}

  

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTransactionDto | null;
    sortOptions?: SortTransactionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Transaction[]> {
    return this.transactionsRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  deductCredits(userId: number, amount: number, type: string): Promise<void> {
    return this.transactionsRepository.deductCredits(userId, amount, type);
  }

  findById(id: Transaction['id']): Promise<NullableType<Transaction>> {
    return this.transactionsRepository.findById(id);
  }


  async remove(id: Transaction['id']): Promise<void> {
    await this.transactionsRepository.remove(id);
  }

  async getTotalBalance(userId: number): Promise<number> {
    return this.transactionsRepository.getTotalBalance(userId);
  }

  async addCredits(userId: number, amount: number, type: string): Promise<void> {
    return this.transactionsRepository.addCredits(userId, amount, type);
  }
}
