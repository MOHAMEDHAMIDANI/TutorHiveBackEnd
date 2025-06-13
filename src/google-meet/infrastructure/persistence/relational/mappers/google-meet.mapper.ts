import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { BookingEntity } from '../../../../../bookings/infrastructure/persistence/relational/entities/booking.entity';
import { GoogleMeet } from '../../../../domain/google-meet';
import { GoogleMeetEntity } from '../entities/google-meet.entity';

export class GoogleMeetMapper {
  static toDomain(raw: GoogleMeetEntity): GoogleMeet {
    const domainEntity = new GoogleMeet();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.startTime = raw.startTime;
    domainEntity.endTime = raw.endTime;
    domainEntity.meetUrl = raw.meetUrl;
    domainEntity.calendarEventId = raw.calendarEventId;
    domainEntity.organizer = raw.organizer;
    domainEntity.attendee = raw.attendee;
    domainEntity.booking = raw.booking;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: GoogleMeet): GoogleMeetEntity {
    const persistenceEntity = new GoogleMeetEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.startTime = domainEntity.startTime;
    persistenceEntity.endTime = domainEntity.endTime;
    persistenceEntity.meetUrl = domainEntity.meetUrl;
    persistenceEntity.calendarEventId = domainEntity.calendarEventId;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    if (domainEntity.organizer) {
      const organizerEntity = new UserEntity();
      organizerEntity.id = Number(domainEntity.organizer.id);
      persistenceEntity.organizer = organizerEntity;
    }

    if (domainEntity.attendee) {
      const attendeeEntity = new UserEntity();
      attendeeEntity.id = Number(domainEntity.attendee.id);
      persistenceEntity.attendee = attendeeEntity;
    }

    if (domainEntity.booking) {
      const bookingEntity = new BookingEntity();
      bookingEntity.id = Number(domainEntity.booking.id);
      persistenceEntity.booking = bookingEntity;
    }

    return persistenceEntity;
  }
} 