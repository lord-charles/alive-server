import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as nodemailer from 'nodemailer';
import {
  Notification,
  NotificationDocument,
  NotificationStatus,
} from '../schemas/notification.schema';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('SMTP_SERVICE'),
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private async _saveNotification(
    notificationDetails: Partial<Notification>,
  ): Promise<void> {
    try {
      await this.notificationModel.create(notificationDetails);
    } catch (error) {
      this.logger.error(
        `Failed to save notification: ${error.message}`,
        error.stack,
      );
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(process.env.SMS_API_URL, {
        apikey: process.env.SMS_API_KEY,
        partnerID: process.env.SMS_PARTNER_ID,
        message: message,
        shortcode: process.env.SMS_SHORTCODE,
        mobile: phoneNumber,
      });

      if (response.status === 200) {
        this.logger.log(`SMS sent successfully to ${phoneNumber}`);
        return true;
      }

      this.logger.error(`Failed to send SMS to ${phoneNumber}`);
      return false;
    } catch (error) {
      this.logger.error(
        `Error sending SMS to ${phoneNumber}: ${error.message}`,
      );
      return false;
    }
  }

  async sendRegistrationPassword(
    email: string,
    message: string,
    phoneNumber?: string,
  ): Promise<boolean> {
    try {
      if (phoneNumber) {
        await this.sendSMS(phoneNumber, message);
      }
      if (email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2c3e50;">Alive Afrique Notification</h2>
            <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        `;
        await this.sendEmail(email, 'Password Reset', emailHtml);
      }
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending registration password: ${error.message}`,
      );
      return false;
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    bcc?: string[],
    cc?: string[],
  ): Promise<boolean> {
    try {
      await this.transporter.verify();
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"Alive" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject,
        html,
      };

      if (bcc && bcc.length > 0) {
        mailOptions.bcc = bcc;
      }

      if (cc && cc.length > 0) {
        mailOptions.cc = cc;
      }

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${to}` +
          (bcc ? ` and ${bcc.length} other(s) in BCC` : '') +
          (cc ? ` and ${cc.length} other(s) in CC` : ''),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`);
      return false;
    }
  }

  async markNotificationAsRead(
    delegateId: string,
    notificationId: string,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        recipient: new Types.ObjectId(delegateId),
      },
      { status: NotificationStatus.READ },
      { new: true },
    );
    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found for delegate ${delegateId}.`,
      );
    }
    return notification;
  }

  async markAllNotificationsAsRead(
    delegateId: string,
  ): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      {
        recipient: new Types.ObjectId(delegateId),
        status: NotificationStatus.UNREAD,
      },
      { status: NotificationStatus.READ },
    );
    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
    };
  }
}
