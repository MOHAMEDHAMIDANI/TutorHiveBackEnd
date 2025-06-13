import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { ServiceEntity } from '../../../../../services/infrastructure/persistence/relational/entities/service.entity';
import { Booking, BookingStatus, BookingType, PaymentStatus } from '../../../../domain/booking';
import { BookingEntity } from '../entities/booking.entity';

export class BookingMapper {
  static toDomain(raw: BookingEntity): Booking {
    const domainEntity = new Booking();

    console.log("DEBUG: Raw booking");
    console.log("DEBUG: Raw booking", raw);
    domainEntity.id = raw.id;
    domainEntity.type = raw.type as BookingType;
    domainEntity.date = raw.date;
    domainEntity.fromTime = raw.fromTime;
    domainEntity.toTime = raw.toTime;
    domainEntity.duration = raw.duration;
    domainEntity.paymentStatus = raw.paymentStatus as PaymentStatus;
    domainEntity.bookingStatus = raw.bookingStatus as BookingStatus;
    domainEntity.amount = raw.amount;
    domainEntity.bookedBy = raw.bookedBy;
    
    if (raw.tutor) {
      domainEntity.tutor = raw.tutor;
    }
    if (raw.service) {
      domainEntity.service = raw.service;
    }
    domainEntity.notes = raw.notes;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Booking): BookingEntity {
    const persistenceEntity = new BookingEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.type = domainEntity.type;
    persistenceEntity.date = domainEntity.date;
    persistenceEntity.fromTime = domainEntity.fromTime;
    persistenceEntity.toTime = domainEntity.toTime;
    persistenceEntity.duration = domainEntity.duration;
    persistenceEntity.paymentStatus = domainEntity.paymentStatus;
    persistenceEntity.bookingStatus = domainEntity.bookingStatus;
    persistenceEntity.amount = domainEntity.amount;

    if (domainEntity.bookedBy) {
      const bookedByEntity = new UserEntity();
      bookedByEntity.id = Number(domainEntity.bookedBy.id);
      persistenceEntity.bookedBy = bookedByEntity;
    }

    if (domainEntity.tutor) {
      const tutorEntity = new UserEntity();
      tutorEntity.id = Number(domainEntity.tutor.id);
      persistenceEntity.tutor = tutorEntity;
    }

    if (domainEntity.service) {
      const serviceEntity = new ServiceEntity();
      serviceEntity.id = Number(domainEntity.service.id);
      persistenceEntity.service = serviceEntity;
    }

    persistenceEntity.notes = domainEntity.notes;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    return persistenceEntity;
  }
}
