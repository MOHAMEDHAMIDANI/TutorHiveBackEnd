import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleMeetEntity } from '../entities/google-meet.entity';
import { GoogleMeetMapper } from '../mappers/google-meet.mapper';
import { GoogleMeet } from '../../../../domain/google-meet';
import { FilterGoogleMeetDto, SortGoogleMeetDto } from '../../../../dto/query-google-meet.dto';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class GoogleMeetRepository {
  constructor(
    @InjectRepository(GoogleMeetEntity)
    private readonly googleMeetRepository: Repository<GoogleMeetEntity>,
  ) {}

  async create(data: GoogleMeet): Promise<GoogleMeet> {
    const persistenceEntity = GoogleMeetMapper.toPersistence(data);
    const newEntity = await this.googleMeetRepository.save(
      this.googleMeetRepository.create(persistenceEntity),
    );
    return GoogleMeetMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterGoogleMeetDto | null;
    sortOptions?: SortGoogleMeetDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<GoogleMeet[]> {
    const where = {} as any;

    if (filterOptions?.title) {
      where.title = filterOptions.title;
    }

    if (filterOptions?.organizer) {
      where.organizer = { id: filterOptions.organizer.id };
    }

    if (filterOptions?.attendee) {
      where.attendee = { id: filterOptions.attendee.id };
    }

    if (filterOptions?.booking) {
      where.booking = { id: filterOptions.booking.id };
    }

    const skip = (paginationOptions.page - 1) * paginationOptions.limit;

    const order = {};

    if (sortOptions) {
      for (const sortOption of sortOptions) {
        order[sortOption.orderBy] = sortOption.order;
      }
    }

    const [items, totalCount] = await this.googleMeetRepository.findAndCount({
      where,
      order,
      skip,
      take: paginationOptions.limit,
    });

    return items.map((item) => GoogleMeetMapper.toDomain(item));
  }

  async findById(id: GoogleMeet['id']): Promise<NullableType<GoogleMeet>> {
    const entity = await this.googleMeetRepository.findOne({
      where: { id: Number(id) },
    });

    return entity ? GoogleMeetMapper.toDomain(entity) : null;
  }

  async findByBookingId(bookingId: number): Promise<NullableType<GoogleMeet>> {
    const entity = await this.googleMeetRepository.findOne({
      where: { booking: { id: bookingId } },
    });

    return entity ? GoogleMeetMapper.toDomain(entity) : null;
  }

  async update(
    id: GoogleMeet['id'],
    payload: DeepPartial<GoogleMeet>,
  ): Promise<GoogleMeet> {
    const entity = await this.googleMeetRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Entity not found');
    }

    const updatedEntity = await this.googleMeetRepository.save(
      this.googleMeetRepository.create({
        ...entity,
        ...GoogleMeetMapper.toPersistence(payload as GoogleMeet),
        id: Number(id),
      }),
    );

    return GoogleMeetMapper.toDomain(updatedEntity);
  }

  async remove(id: GoogleMeet['id']): Promise<void> {
    await this.googleMeetRepository.softDelete(Number(id));
  }
} 