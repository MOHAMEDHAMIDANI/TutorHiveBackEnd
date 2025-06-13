import { User } from "src/users/domain/user";
import { Service } from "src/services/domain/service";
import { DeepPartial } from "../../../utils/types/deep-partial.type";
import { NullableType } from "../../../utils/types/nullable.type";
import { IPaginationOptions } from "../../../utils/types/pagination-options";
import { Booking, BookingStatus } from "../../domain/booking";

import { FilterBookingDto, SortBookingDto } from "../../dto/query-booking.dto";

export abstract class BookingRepository {
  abstract create(
    data: Omit<Booking, "id" | "createdAt" | "deletedAt" | "updatedAt">
  ): Promise<Booking>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBookingDto | null;
    sortOptions?: SortBookingDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Booking[]>;

  abstract findById(id: Booking["id"]): Promise<NullableType<Booking>>;

  abstract findByUser(user: User["id"]): Promise<NullableType<Booking>>;

  abstract update(
    id: Booking["id"],
    payload: Partial<
      Pick<
        Booking,
        | "type"
        | "date"
        | "fromTime"
        | "toTime"
        | "duration"
        | "paymentStatus"
        | "bookingStatus"
        | "amount"
        | "bookedBy"
        | "tutor"
        | "service"
        | "notes"
      >
    >
  ): Promise<Booking>;
  abstract findAllBookingsWithPagination({
    sortOptions,
    paginationOptions,
  }: {
    sortOptions?: SortBookingDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Booking[]>;
  abstract remove(id: Booking["id"]): Promise<void>;
  // find all bookings
  abstract findConfirmedBookings(): Promise<Booking[]>;
  abstract findCanceledBookings(): Promise<Booking[]>;
  abstract findPendingBookings(): Promise<Booking[]>;
  abstract findCompletedBookings(): Promise<Booking[]>;
  // delete booking
  abstract deleteBooking(id: Booking["id"]): Promise<void>;
  // update booking status
  abstract updateBookingStatus(
    id: Booking["id"],
    status: BookingStatus
  ): Promise<Boolean>;
  abstract cancelBooking(id: Booking["id"]): Promise<void>;

  abstract confirmBooking(id: Booking["id"]): Promise<void>;

  abstract completeBooking(id: Booking["id"]): Promise<void>;
}
