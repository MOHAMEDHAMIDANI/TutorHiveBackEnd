import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Like, Repository, In } from "typeorm";
import { BookingEntity } from "../entities/booking.entity";
import { NullableType } from "../../../../../utils/types/nullable.type";
import {
  FilterBookingDto,
  SortBookingDto,
} from "../../../../dto/query-booking.dto";
import { Booking, BookingStatus } from "../../../../domain/booking";
import { BookingMapper } from "../mappers/booking.mapper";
import { IPaginationOptions } from "../../../../../utils/types/pagination-options";
import { BookingRepository } from "../../booking.repository";
import { User } from "src/users/domain/user";

@Injectable()
export class BookingsRelationalRepository implements BookingRepository {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingsRepository: Repository<BookingEntity>
  ) {}

  async create(data: Booking): Promise<Booking> {
    const persistenceModel = BookingMapper.toPersistence(data);
    const newEntity = await this.bookingsRepository.save(
      this.bookingsRepository.create(persistenceModel)
    );
    return BookingMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBookingDto | null;
    sortOptions?: SortBookingDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Booking[]> {
    const queryBuilder = this.bookingsRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.bookedBy', 'bookedBy')
      .leftJoinAndSelect('booking.tutor', 'tutor')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('service.user', 'serviceUser')
      .leftJoinAndSelect('bookedBy.role', 'bookedByRole')
      .leftJoinAndSelect('bookedBy.status', 'bookedByStatus');

    if (filterOptions) {
      if (filterOptions.$or) {
        // Handle OR conditions using query builder
        const orConditions = filterOptions.$or.map(condition => {
          if (condition.tutor) {
            return 'tutor.id = :tutorId';
          }
          if (condition.serviceUserId) {
            return 'serviceUser.id = :serviceUserId';
          }
          if (condition.service?.user) {
            return 'serviceUser.id = :serviceUserObjectId';
          }
          return null;
        }).filter(Boolean);

        if (orConditions.length > 0) {
          queryBuilder.andWhere(`(${orConditions.join(' OR ')})`);
          
          // Add parameters
          filterOptions.$or.forEach(condition => {
            if (condition.tutor) {
              queryBuilder.setParameter('tutorId', Number(condition.tutor.id));
            }
            if (condition.serviceUserId) {
              queryBuilder.setParameter('serviceUserId', Number(condition.serviceUserId));
            }
            if (condition.service?.user) {
              queryBuilder.setParameter('serviceUserObjectId', Number(condition.service.user.id));
            }
          });
        }
      } else {
        // Handle regular filters
        if (filterOptions.type) {
          queryBuilder.andWhere('booking.type = :type', { type: filterOptions.type });
        }
        if (filterOptions.date) {
          queryBuilder.andWhere('booking.date = :date', { date: filterOptions.date });
        }
        if (filterOptions.fromTime) {
          queryBuilder.andWhere('booking.fromTime = :fromTime', { fromTime: filterOptions.fromTime });
        }
        if (filterOptions.toTime) {
          queryBuilder.andWhere('booking.toTime = :toTime', { toTime: filterOptions.toTime });
        }
        if (filterOptions.paymentStatus) {
          queryBuilder.andWhere('booking.paymentStatus = :paymentStatus', { paymentStatus: filterOptions.paymentStatus });
        }
        if (filterOptions.bookingStatus) {
          queryBuilder.andWhere('booking.bookingStatus = :bookingStatus', { bookingStatus: filterOptions.bookingStatus });
        }
        if (filterOptions.bookedBy) {
          queryBuilder.andWhere('bookedBy.id = :bookedById', { bookedById: Number(filterOptions.bookedBy) });
        }
        if (filterOptions.tutor) {
          queryBuilder.andWhere('tutor.id = :tutorId', { tutorId: Number(filterOptions.tutor.id) });
        }
        if (filterOptions.service) {
          queryBuilder.andWhere('service.id = :serviceId', { serviceId: Number(filterOptions.service.id) });
        }
        if (filterOptions.serviceUserId) {
          queryBuilder.andWhere('serviceUser.id = :serviceUserId', { serviceUserId: Number(filterOptions.serviceUserId) });
        }
      }
    }

    // Add sorting
    if (sortOptions?.length) {
      sortOptions.forEach(sort => {
        queryBuilder.addOrderBy(`booking.${sort.orderBy}`, sort.order.toUpperCase() as 'ASC' | 'DESC');
      });
    }

    // Add pagination
    queryBuilder
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit);

    const entities = await queryBuilder.getMany();
    return entities.map((booking) => BookingMapper.toDomain(booking));
  }
  async findConfirmedBookings(): Promise<Booking[]> {
    const where = {
      bookingStatus: BookingStatus.CONFIRMED,
    };

    const entities = await this.bookingsRepository.find({
      where: where,
    });
    return entities.map((booking) => BookingMapper.toDomain(booking));
  }
  async findCompletedBookings(): Promise<Booking[]> {
    const where = {
      bookingStatus: BookingStatus.COMPLETED,
    };

    const entities = await this.bookingsRepository.find({
      where: where,
    });
    return entities.map((booking) => BookingMapper.toDomain(booking));
  }
  async findCanceledBookings(): Promise<Booking[]> {
    const where = {
      bookingStatus: BookingStatus.CANCELLED,
    };
    console.log("Hits here");
    const entities = await this.bookingsRepository.find({
      where: where,
    });
    return entities.map((booking) => BookingMapper.toDomain(booking));
  }
  async findPendingBookings(): Promise<Booking[]> {
    const where = {
      bookingStatus: BookingStatus.PENDING,
    };
    console.log("Hits here");
    const entities = await this.bookingsRepository.find({
      where: where,
    });
    return entities.map((booking) => BookingMapper.toDomain(booking));
  }
  //delete booking
  async deleteBooking(id: Booking["id"]): Promise<void> {
    await this.bookingsRepository.delete(id);
  }
  // update booking status
  async updateBookingStatus(
    id: Booking["id"],
    status: BookingStatus
  ): Promise<Boolean> {
    const updatedBooking = await this.bookingsRepository.update(id, {
      bookingStatus: status,
    });
    const flag: Boolean = (updatedBooking.affected ?? 0) > 0 ? true : false;
    return flag;
  }
  async findAllBookingsWithPagination({
    sortOptions,
    paginationOptions,
  }: {
    sortOptions?: SortBookingDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Booking[]> {
    const entities = await this.bookingsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: {
        bookedBy: {
          role: true,
          status: true,
        },
        tutor: true,
        service: {
          user: true,
        },
      },
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {}
      ),
    });

    return entities.map((booking) => BookingMapper.toDomain(booking));
  }

  async findByUser(user: User["id"]): Promise<NullableType<Booking>> {
    const entity = await this.bookingsRepository.findOne({
      where: { bookedBy: { id: Number(user) } },
    });
    return entity ? BookingMapper.toDomain(entity) : null;
  }

  async findById(id: Booking["id"]): Promise<NullableType<Booking>> {
    const entity = await this.bookingsRepository.findOne({
      where: { id: Number(id) },
      relations: {
        bookedBy: {
          role: true,
          status: true,
        },
        tutor: true,
        service: {
          user: true,
        },
      },
    });

    return entity ? BookingMapper.toDomain(entity) : null;
  }

  async update(id: Booking["id"], payload: Partial<Booking>): Promise<Booking> {
    const entity = await this.bookingsRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error("Booking not found");
    }

    const updatedEntity = await this.bookingsRepository.save(
      this.bookingsRepository.create(
        BookingMapper.toPersistence({
          ...BookingMapper.toDomain(entity),
          ...payload,
        })
      )
    );

    return BookingMapper.toDomain(updatedEntity);
  }

  async remove(id: Booking["id"]): Promise<void> {
    await this.bookingsRepository.softDelete(id);
  }

  async cancelBooking(id: Booking["id"]): Promise<void> {
    await this.bookingsRepository.update(id, {
      bookingStatus: BookingStatus.CANCELLED,
    });
  }

  async confirmBooking(id: Booking["id"]): Promise<void> {
    await this.bookingsRepository.update(id, {
      bookingStatus: BookingStatus.CONFIRMED,
    });
  }

  async completeBooking(id: Booking["id"]): Promise<void> {
    await this.bookingsRepository.update(id, {
      bookingStatus: BookingStatus.COMPLETED,
    });
  }
}

