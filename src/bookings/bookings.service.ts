import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { NullableType } from "../utils/types/nullable.type";
import { FilterBookingDto, SortBookingDto } from "./dto/query-booking.dto";
import { BookingRepository } from "./infrastructure/persistence/booking.repository";
import {
  Booking,
  BookingStatus,
  BookingType,
  PaymentStatus,
} from "./domain/booking";
import { StatusEnum } from "../statuses/statuses.enum";
import { IPaginationOptions } from "../utils/types/pagination-options";
import { DeepPartial } from "../utils/types/deep-partial.type";
import { JwtPayloadType } from "src/auth/strategies/types/jwt-payload.type";
import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/infrastructure/persistence/relational/entities/user.entity";
import { ServiceEntity } from "src/services/infrastructure/persistence/relational/entities/service.entity";
import { BookingEntity } from "./infrastructure/persistence/relational/entities/booking.entity";
import { ServicesService } from "src/services/services.service";
import { TransactionsService } from "src/transactions/transactions.service";
import { MailService } from "src/mail/mail.service";
import {
  TimeSlotDto,
  UnavailableDateDto,
} from "src/auth/dto/auth-register-login.dto";

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingRepository,
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
    private readonly transactionsService: TransactionsService,
    private readonly mailService: MailService
  ) {}

  async create(
    createProfileDto: CreateBookingDto,
    user: JwtPayloadType
  ): Promise<Booking> {
    console.log("DEBUG: Starting create booking", { createProfileDto, user });

    const clonedPayload = {
      ...createProfileDto,
    };

    const userObject = await this.usersService.findById(user.id);
    console.log("DEBUG: Found user object", userObject);

    if (!userObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: "userNotFound",
        },
      });
    }

    const tutor = new UserEntity();
    tutor.id = Number(clonedPayload.tutorId);
    console.log("DEBUG: Created tutor entity", tutor);

    let creditsToDeduct = 0;

    // Calculate required credits based on booking type
    if (clonedPayload.type === BookingType.SERVICE) {
      const service = await this.servicesService.findById(
        Number(clonedPayload.serviceId)
      );
      console.log("DEBUG: Found service", service);

      if (!service) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            service: "serviceNotFound",
          },
        });
      }
      creditsToDeduct = service.price;
    } else if (clonedPayload.type === BookingType.TUTOR) {
      const tutorObject = await this.usersService.findById(tutor.id);
      console.log("DEBUG: Found tutor object", tutorObject);

      if (!tutorObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            tutor: "tutorNotFound",
          },
        });
      }
      if (!tutorObject.hourlyRate) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            tutor: "tutorHasNoRate",
          },
        });
      }
      creditsToDeduct = tutorObject.hourlyRate;
    }

    const myCredits = await this.transactionsService.getTotalBalance(
      Number(user.id)
    );
    creditsToDeduct = parseInt(creditsToDeduct.toString());
    console.log("DEBUG: Credits check", { myCredits, creditsToDeduct });

    // Check if user has enough credits
    if (myCredits < creditsToDeduct) {
      throw new UnprocessableEntityException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          credits: "insufficientCredits",
          requiredCredits: creditsToDeduct,
          availableCredits: myCredits,
        },
      });
    }

    // Deduct credits from user
    await this.transactionsService.deductCredits(
      Number(user.id),
      creditsToDeduct,
      "Booking"
    );
    console.log("DEBUG: Credits deducted successfully");

    const bookedBy = new UserEntity();
    bookedBy.id = Number(user.id);

    // // Check if user already booked this tutor
    // const existingBooking = await this.bookingsRepository.findManyWithPagination({
    //   filterOptions: {
    //     bookedBy: bookedBy,
    //     tutor: tutor
    //   },
    //   paginationOptions: {
    //     page: 1,
    //     limit: 1
    //   }
    // });

    // if (existingBooking.length > 0) {
    //   throw new UnprocessableEntityException({
    //     status: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: {
    //       booking: 'bookingAlreadyExists',
    //     },
    //   });
    // }

    const service = new ServiceEntity();
    service.id = Number(clonedPayload.serviceId);

    // Check if user already booked this service
    // const existingBooking2 = await this.bookingsRepository.findManyWithPagination({
    //   filterOptions: {
    //     bookedBy: bookedBy,
    //     service: service,
    //   },
    //   paginationOptions: {
    //     page: 1,
    //     limit: 1
    //   }
    // });
    // console.log("DEBUG: Checked existing bookings", existingBooking2);

    // if (existingBooking2.length > 0) {
    //   throw new UnprocessableEntityException({
    //     status: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: {
    //       booking: 'bookingAlreadyExists',
    //     },
    //   });
    // }

    const booking = new BookingEntity();
    booking.type = clonedPayload.serviceId
      ? BookingType.SERVICE
      : BookingType.TUTOR;
    booking.date = clonedPayload.date;
    booking.fromTime = clonedPayload.fromTime;
    booking.toTime = clonedPayload.toTime;
    // booking.duration = clonedPayload.duration;
    booking.paymentStatus = PaymentStatus.PAID;
    booking.bookingStatus = BookingStatus.CONFIRMED;
    booking.amount = creditsToDeduct;
    booking.bookedBy = bookedBy;
    booking.notes = clonedPayload.notes;
    booking.duration = 60;

    if (clonedPayload.serviceId) {
      booking.service = service;
    } else {
      booking.tutor = tutor;
    }
    console.log("DEBUG: Created booking entity", booking);

    const x = await this.bookingsRepository.create(booking);
    console.log("DEBUG: Saved booking", x);

    const busyTimeSlot: TimeSlotDto = {
      from: booking.fromTime,
      to: booking.toTime,
    };

    const markAsBusy: UnavailableDateDto = {
      date: new Date(booking.date).toISOString(),
      timeSlots: [busyTimeSlot],
    };
    console.log("DEBUG: Created busy time slot", { busyTimeSlot, markAsBusy });

    // await this.usersService.markAsBusy(markAsBusy, tutor.id);

    return x;
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBookingDto | null;
    sortOptions?: SortBookingDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Booking[]> {
    return this.bookingsRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }
  findAllConfirmedBookings(): Promise<Booking[]> {
    return this.bookingsRepository.findConfirmedBookings();
  }
  findAllCanceledBookings(): Promise<Booking[]> {
    return this.bookingsRepository.findCanceledBookings();
  }
  findAllPendingBookings(): Promise<Booking[]> {
    return this.bookingsRepository.findPendingBookings();
  }
  findAllCompletedBookings(): Promise<Booking[]> {
    return this.bookingsRepository.findCompletedBookings();
  }
  // delete booking
  deleteBooking(id: Booking["id"]): Promise<void> {
    return this.bookingsRepository.remove(id);
  }
  // update booking status
  updateBookingStatus(
    id: Booking["id"],
    status: BookingStatus
  ): Promise<Boolean> {
    return this.bookingsRepository.updateBookingStatus(id, status);
  }
  findAllBookingsWithPagination({
    sortOptions,
    paginationOptions,
  }: {
    sortOptions?: SortBookingDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Booking[]> {
    return this.bookingsRepository.findManyWithPagination({
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: Booking["id"]): Promise<NullableType<Booking>> {
    return this.bookingsRepository.findById(id);
  }

  async update(
    id: Booking["id"],
    payload: DeepPartial<Booking>,
    user: JwtPayloadType
  ): Promise<Booking | null> {
    const clonedPayload = { ...payload };

    if (clonedPayload.bookingStatus) {
      const validStatus = Object.values(BookingStatus).includes(
        clonedPayload.bookingStatus
      );
      if (!validStatus) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: "invalidBookingStatus",
          },
        });
      }
    }

    const userObject = await this.usersService.findById(user.id);

    if (!userObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: "userNotFound",
        },
      });
    }

    // return this.bookingsRepository.update(id, clonedPayload);
    return null;
  }

  async remove(id: Booking["id"]): Promise<void> {
    await this.bookingsRepository.remove(id);
  }

  async cancelBooking(id: Booking["id"], user: JwtPayloadType): Promise<void> {
    const booking = await this.findById(id);

    if (!booking) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          booking: "bookingNotFound",
        },
      });
    }
    await this.bookingsRepository.cancelBooking(id);

    await this.mailService.bookingStatusUpdate({
      to: booking.bookedBy.email || "",
      data: { booking: booking },
      sendVerification: false,
      verificationType: "",
      userId: booking.bookedBy.id,
    });
  }

  async confirmBooking(id: Booking["id"], user: JwtPayloadType): Promise<void> {
    const booking = await this.findById(id);

    if (!booking) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          booking: "bookingNotFound",
        },
      });
    }
    await this.bookingsRepository.confirmBooking(id);

    await this.mailService.bookingStatusUpdate({
      to: booking.bookedBy.email || "",
      data: { booking: booking },
      sendVerification: false,
      verificationType: "",
      userId: booking.bookedBy.id,
    });
  }

  async completeBooking(
    id: Booking["id"],
    user: JwtPayloadType
  ): Promise<void> {
    const booking = await this.findById(id);

    if (!booking) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          booking: "bookingNotFound",
        },
      });
    }
    await this.bookingsRepository.completeBooking(id);

    await this.mailService.bookingStatusUpdate({
      to: booking.bookedBy.email || "",
      data: { booking: booking },
      sendVerification: false,
      verificationType: "",
      userId: booking.bookedBy.id,
    });
  }
}
