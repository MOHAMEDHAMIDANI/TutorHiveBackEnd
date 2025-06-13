import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterBidDto, SortBidDto } from './dto/query-bid.dto';
import { BidRepository } from './infrastructure/persistence/bid.repository';
import { Bid, BidStatusEnum } from './domain/bid';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { JobsService } from 'src/jobs/jobs.service';
import { JobEntity } from 'src/jobs/infrastructure/persistence/relational/entities/job.entity';
import { TransactionsService } from 'src/transactions/transactions.service';

@Injectable()
export class BidsService {
  constructor(
    private readonly bidsRepository: BidRepository,
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
    private readonly mailService: MailService,
    private readonly transactionsService: TransactionsService
  ) {}

  async create(createBidDto: CreateBidDto, user: JwtPayloadType): Promise<Bid> {
    const tutor = await this.usersService.findById(user.id);
    if (!tutor) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          tutor: 'tutorNotFound',
        },
      });
    }

    const job = await this.jobsService.findById(createBidDto.jobId);
    if (!job) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          job: 'jobNotFound',
        },
      });
    }
    // Create entities for filtering
    console.log('Creating filter entities with user ID:', user.id, 'and job ID:', job.id);
    
    const tutorE:UserEntity = new UserEntity()
    tutorE.id = Number(user.id)
    const jobE:JobEntity = new JobEntity()
    jobE.id = job.id

    // Check if tutor already bid on this post
    console.log('Checking for existing bids with filter:', {
      tutor: tutorE,
      jobId: job.id
    });

    const existingBids = await this.bidsRepository.findManyWithPagination({
      filterOptions: {
        tutor: tutorE,
        jobId: job.id
      },
      paginationOptions: {
        page: 1,
        limit: 1
      }
    });

    console.log('Found existing bids:', existingBids);

    // if (existingBids.length > 0) {
    //   console.log('Duplicate bid detected for tutor:', tutorE.id, 'on job:', job.id);
    //   throw new UnprocessableEntityException({
    //     status: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: {
    //       bid: 'bidAlreadyExists',
    //     },
    //   });
    // }

    const bid = await this.bidsRepository.create({
      price: createBidDto.price,
      job: jobE,
      tutor,
      proposal: createBidDto.proposal,
      status: BidStatusEnum.pending
    });

    const createdBid = await this.bidsRepository.findById(bid.id);
    console.log("Created bid", createdBid)
    if(createdBid?.tutor.email) {
      await this.mailService.yourBidHasBeen({
        to: createdBid.tutor.email || '',
        data: { bid: createdBid },
        sendVerification: false,
        verificationType: "",
        userId: createdBid.tutor.id
      });
    }

    return bid;
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBidDto | null;
    sortOptions?: SortBidDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Bid[]> {
    return this.bidsRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: Bid['id']): Promise<NullableType<Bid>> {
    return this.bidsRepository.findById(id);
  }

  async update(
    id: Bid['id'],
    payload: DeepPartial<Bid>,
  ): Promise<Bid> {
    const bid = await this.bidsRepository.findById(id);
    if (!bid) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          bid: 'bidNotFound',
        },
      });
    }

    return this.bidsRepository.update(id, {
      status: payload.status as BidStatusEnum
    });
  }

  async remove(id: Bid['id']): Promise<void> {
    await this.bidsRepository.remove(id);
  }

  async rejectBid(bid: Bid): Promise<Bid> {
    await this.bidsRepository.update(bid.id, {
      status: BidStatusEnum.rejected
    });

    await this.mailService.yourBidHasBeen({
      to: bid.tutor.email || '',
      data: { bid },
      sendVerification: false,
      verificationType: "",
      userId: bid.tutor.id
    });

    return bid;
  }

  async acceptBid(bid: Bid, user: JwtPayloadType): Promise<Bid> {



    let creditsToDeduct = bid.price;
    // get user's balance
    // const bidObject = 
    const myCredits = await this.transactionsService.getTotalBalance(Number(user.id));
    creditsToDeduct = parseInt(creditsToDeduct.toString());
    console.log("DEBUG: Credits check", { myCredits, creditsToDeduct });

    // Check if user has enough credits
    if (myCredits < creditsToDeduct) {
      throw new UnprocessableEntityException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          credits: 'insufficientCredits',
          requiredCredits: creditsToDeduct,
          availableCredits: myCredits,
        },
      });
    }

    // Deduct credits from user
    await this.transactionsService.deductCredits(Number(user.id), creditsToDeduct, "Booked a tutor");
    console.log("DEBUG: Credits deducted successfully");



    await this.bidsRepository.update(bid.id, {
      status: BidStatusEnum.accepted
    });

    await this.mailService.yourBidHasBeen({
      to: bid.tutor.email || '',
      data: { bid },
      sendVerification: false,
      verificationType: "",
      userId: bid.tutor.id
    });

    return bid;
  }

  async findByJobId(jobId: number): Promise<Bid[]> {
    return this.bidsRepository.findManyWithPagination({
      filterOptions: {
        jobId: jobId
      },
      paginationOptions: {
        page: 1,
        limit: 100
      }
    });
  }
}
