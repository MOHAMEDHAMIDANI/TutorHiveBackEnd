import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { BookingsModule } from "src/bookings/bookings.module";
import { JobsModule } from "src/jobs/jobs.module";
import { AuthModule } from "src/auth/auth.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [UsersModule, BookingsModule, JobsModule, AuthModule, MailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
