import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

import { MaybeType } from '../utils/types/maybe.type';
import { MailerService } from '../mailer/mailer.service';
import path from 'path';
import { AllConfigType } from '../config/config.type';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/domain/user';
import { ApplyForTutorDTO } from 'src/auth/dto/auth-register-login.dto';
import { Booking } from 'src/bookings/domain/booking';
import { Bid } from 'src/bids/domain/bid';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly userService: UsersService
  ) {}

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    
    const otp_len:number = parseInt(process.env.OTP_LENGTH_END  || "8888");
    const random6Digits = Math.floor(1000 + Math.random() * otp_len);

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-email.text1'),
        i18n.t('confirm-email.text2'),
        i18n.t('confirm-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/emai/confirm/',
    );
    url.searchParams.set('hash', mailData.data.hash);

    if(!mailData.sendVerification){
      return
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        mailData.verificationType=="otp"? 'activation.hbs':'activation_link.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        authCode:random6Digits, 
        authLink:url,
        authType:mailData.verificationType,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });

    if(mailData.verificationType=="otp"){
      await  this.userService.update(mailData.userId, {
        verificationCode4: random6Digits,
      });
    }

    return;
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('reset-password.text1'),
        i18n.t('reset-password.text2'),
        i18n.t('reset-password.text3'),
        i18n.t('reset-password.text4'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/password-change',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());
    const otp_len:number = parseInt(process.env.OTP_LENGTH_END  || "8888");
    const random6Digits = Math.floor(1000 + Math.random() * otp_len);
    if(!mailData.sendVerification){
      return
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        mailData.verificationType=="otp"?'reset-password-otp.hbs':'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: mailData.verificationType=="otp"?random6Digits: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1,
        text2,
        text3,
        text4,
      },


    });

    if(mailData.verificationType=="otp"){
      await  this.userService.update(mailData.userId, {
        verificationCode4: random6Digits,
      });
    }
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-new-email.text1'),
        i18n.t('confirm-new-email.text2'),
        i18n.t('confirm-new-email.text3'),
      ]);
    }

    const otp_len:number = parseInt(process.env.OTP_LENGTH_END  || "8888");
    const random6Digits = Math.floor(1000 + Math.random() * otp_len);

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        mailData.verificationType=="otp"?'confirm-new-email-otp.hbs':'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: mailData.verificationType=="otp"? random6Digits: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }


  async applyForTutor(mailData: MailData<{ user: User; dto: ApplyForTutorDTO, userId: number }>): Promise<void> {
    const i18n = I18nContext.current();
    let applicationTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [applicationTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.tutorApplication'),
        i18n.t('text1'),
        i18n.t('text2'),
        i18n.t('text3'),
      ]);
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: applicationTitle || 'Tutor Application Under Review',
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'tutor-application.hbs',
      ),
      context: {
        title: applicationTitle || 'Tutor Application Under Review',
        firstName: mailData.data.user.firstName,
        app_name: this.configService.getOrThrow('app.name', { infer: true }),
        text1: 'Thank you for applying to become a tutor.',
        text2: 'Our admin team is currently reviewing your application. This process typically takes 1-2 business days.',
        text3: 'We will notify you via email once a decision has been made regarding your application.',
      },
    });
  }

  async tutorApplicationUpdate(mailData: MailData<{ user: User; approved: boolean; reason?: string; message: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailTitle: MaybeType<string>;
    
    if (i18n) {
      emailTitle = await i18n.t('common.tutorApplicationUpdate');
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailTitle || (mailData.data.approved ? 'Tutor Application Approved' : 'Tutor Application Rejected'),
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        mailData.data.approved ? 'tutor-application-approved.hbs' : 'tutor-application-rejected.hbs',
      ),
      context: {
        title: emailTitle || (mailData.data.approved ? 'Tutor Application Approved' : 'Tutor Application Rejected'),
        firstName: mailData.data.user.firstName,
        message: mailData.data.message,
        reason: mailData.data.reason || '',
        app_name: this.configService.getOrThrow('app.name', { infer: true }),
      },
    });
  }

  async bookingStatusUpdate(mailData: MailData<{ booking: Booking }>): Promise<void> {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Booking Status Update',
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'booking-status-update.hbs',
      ),
      context: {
        title: 'Booking Status Update',
        firstName: mailData.data.booking.bookedBy.firstName,
        date: mailData.data.booking.date,
        fromTime: mailData.data.booking.fromTime,
        toTime: mailData.data.booking.toTime,
        status: mailData.data.booking.bookingStatus,
        app_name: this.configService.get('app.name', { infer: true }),
      },
    });
  }

  async someoneBidOnYourPost(mailData: MailData<{ bid: Bid }>): Promise<void> {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Someone Bid on Your Post',
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'someone-bid-on-your-post.hbs',
      ),
      context: {
        title: 'Someone Bid on Your Post',
        firstName: mailData.data.bid.job.postedBy.firstName,
        postTitle: mailData.data.bid.job.title,
        price: mailData.data.bid.price,
        tutorName: mailData.data.bid.tutor.firstName,
        app_name: this.configService.get('app.name', { infer: true }),
      },
    });
  }

  async yourBidHasBeen(mailData: MailData<{ bid: Bid }>): Promise<void> {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Your Bid Has Been',
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'your-bid-has-been.hbs',
      ),
      context: {
        title: 'Your Bid Has Been',
        app_name: this.configService.get('app.name', { infer: true }),
        firstName: mailData.data.bid.tutor.firstName,
        postTitle: mailData.data.bid.job.title,
        status: mailData.data.bid.status,
        price: mailData.data.bid.price,
      },
    });
  }

}
