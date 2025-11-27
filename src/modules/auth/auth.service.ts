import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { LoginUserDto } from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
} from './dto/reset-password.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/verify-otp.dto';
import {
  JwtPayload,
  AuthResponse,
  TokenPayload,
} from './interfaces/auth.interface';
import { User, UserDocument } from './schemas/user.schema';
import { SystemLogsService } from '../system-logs/services/system-logs.service';
import { LogSeverity } from '../system-logs/schemas/system-log.schema';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notifications/services/notification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly systemLogsService: SystemLogsService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
    req?: Request,
  ): Promise<AuthResponse> {
    try {
      const user = await this.userService.register(createUserDto);

      // Generate OTP codes
      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP codes to user
      (user as UserDocument).emailOtp = emailOtp;
      (user as UserDocument).phoneOtp = phoneOtp;
      (user as UserDocument).emailOtpExpires = expiryDate;
      (user as UserDocument).phoneOtpExpires = expiryDate;
      const savedUser = await (user as UserDocument).save();

      console.log('OTP codes generated and saved:', {
        email: user.email,
        emailOtp,
        phoneOtp,
        expiryDate,
        savedEmailOtp: savedUser.emailOtp,
        savedPhoneOtp: savedUser.phoneOtp,
      });

      // Send OTP codes
      const emailMessage = `Your email verification code is: ${emailOtp}. This code will expire in 10 minutes.`;
      const phoneMessage = `Your phone verification code is: ${phoneOtp}. This code will expire in 10 minutes.`;

      // Send email OTP (only to email)
      await this.notificationService.sendRegistrationPassword(
        user.email,
        emailMessage,
      );

      // Send phone OTP (only to phone via SMS)
      if (user.phoneNumber) {
        await this.notificationService.sendSMS(user.phoneNumber, phoneMessage);
      }

      const token = await this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token: token.token,
      };
    } catch (error) {
      await this.systemLogsService.createLog(
        'Registration Failed',
        `Registration failed for email ${createUserDto.email}: ${error.message}`,
        LogSeverity.ERROR,
        undefined,
        req,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(
    loginUserDto: LoginUserDto,
    req?: Request,
  ): Promise<AuthResponse> {
    try {
      const user = await this.userService.findByEmail(loginUserDto.email, true);

      if (!user) {
        await this.systemLogsService.createLog(
          'Alive Login Failed',
          `User not found with email: ${loginUserDto.email}`,
          LogSeverity.WARNING,
          undefined,
          req,
        );
        throw new UnauthorizedException(
          'Alive: Invalid credentials or user not found.',
        );
      }

      if (user.status !== 'active') {
        throw new UnauthorizedException('Account is not active');
      }

      if (!user.password) {
        throw new UnauthorizedException('Alive: Authentication process error.');
      }
      const isValidPassword = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (!isValidPassword) {
        throw new UnauthorizedException('Alive: Invalid credentials.');
      }

      const token = await this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token: token.token,
      };
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        await this.systemLogsService.createLog(
          'Login Error',
          `Unexpected error during login: ${error.message}`,
          LogSeverity.ERROR,
          undefined,
          req,
        );
      }
      throw error;
    }
  }

  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
    req?: Request,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userService.findByEmail(
        requestPasswordResetDto.email,
      );
      if (!user) {
        await this.systemLogsService.createLog(
          'Alive Password Reset Request Failed',
          `Password reset attempt for non-existent email: ${requestPasswordResetDto.email}`,
          LogSeverity.WARNING,
          undefined,
          req,
        );
        return {
          message:
            'Alive: If your email is registered, you will receive a password reset PIN.',
        };
      }

      const resetPin = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // PIN expires in 10 minutes

      user.resetPasswordPin = resetPin;
      user.resetPasswordExpires = expiryDate;
      await (user as UserDocument).save();

      const resetMessage = `Your Alive password reset PIN is: ${resetPin}. This PIN will expire in 10 minutes. Please keep this PIN secure and do not share it with anyone.`;
      await this.notificationService.sendRegistrationPassword(
        user.phoneNumber,
        user.email,
        resetMessage,
      );

      return {
        message:
          'Alive: If your email is registered, you will receive a password reset PIN.',
      };
    } catch (error) {
      await this.systemLogsService.createLog(
        'Alive Password Reset Request Error',
        `Error during password reset request for ${requestPasswordResetDto.email}: ${error.message}`,
        LogSeverity.ERROR,
        undefined,
        req,
      );
      throw new BadRequestException(
        'Alive: Could not process password reset request. Please try again later.',
      );
    }
  }

  async confirmPasswordReset(
    confirmPasswordResetDto: ConfirmPasswordResetDto,
    req?: Request,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userService.findByEmail(
        confirmPasswordResetDto.email,
        true,
      );

      if (!user || !user.resetPasswordPin || !user.resetPasswordExpires) {
        throw new BadRequestException(
          'Alive: Invalid or expired password reset PIN.',
        );
      }

      if (user.resetPasswordExpires < new Date()) {
        throw new BadRequestException('Alive: Password reset PIN has expired.');
      }

      if (user.resetPasswordPin !== confirmPasswordResetDto.resetToken) {
        throw new BadRequestException('Alive: Invalid password reset PIN.');
      }

      user.password = confirmPasswordResetDto.newPassword;
      user.resetPasswordPin = undefined;
      user.resetPasswordExpires = undefined;
      await (user as UserDocument).save();

      return { message: 'Alive: Your password has been successfully reset.' };
    } catch (error) {
      await this.systemLogsService.createLog(
        'Alive Password Reset Confirmation Failed',
        `Error confirming password reset for ${confirmPasswordResetDto.email}: ${error.message}`,
        LogSeverity.ERROR,
        undefined,
        req,
      );
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        'Alive: Could not reset password. Please try again.',
      );
    }
  }

  private async generateToken(user: User): Promise<TokenPayload> {
    const payload: JwtPayload = {
      sub: (user as UserDocument)._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    // For 1 year: 365 days * 24 hours * 60 minutes * 60 seconds
    const token = this.jwtService.sign(payload, {
      expiresIn: 365 * 24 * 60 * 60,
    });

    return {
      token,
      expiresIn: 365 * 24 * 60 * 60,
    };
  }

  /**
   * Remove sensitive information from user object
   */
  sanitizeUser(user: User | UserDocument): Partial<User> {
    const userObj = 'toObject' in user ? user.toObject() : user;
    // Ensure all sensitive fields are excluded
    const {
      password,
      pin,
      resetPasswordPin,
      resetPasswordExpires,
      ...sanitizedUser
    } = userObj as any;
    return sanitizedUser;
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Alive: User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Verify OTP codes for email and phone
   */
  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
    req?: Request,
  ): Promise<{ message: string }> {
    try {
      console.log('Verifying OTP for:', verifyOtpDto.email);

      const user = await this.userService.findByEmail(verifyOtpDto.email, true);

      if (!user) {
        console.log('User not found:', verifyOtpDto.email);
        throw new BadRequestException('User not found');
      }

      console.log('User found, checking OTPs:', {
        hasEmailOtp: !!user.emailOtp,
        hasPhoneOtp: !!user.phoneOtp,
        emailOtpExpires: user.emailOtpExpires,
        phoneOtpExpires: user.phoneOtpExpires,
      });

      // Check if OTPs exist
      if (!user.emailOtp || !user.phoneOtp) {
        console.log('OTP codes not found for user');
        throw new BadRequestException(
          'OTP codes not found. Please request new codes.',
        );
      }

      // Check if OTPs are expired
      const now = new Date();
      if (
        !user.emailOtpExpires ||
        !user.phoneOtpExpires ||
        user.emailOtpExpires < now ||
        user.phoneOtpExpires < now
      ) {
        console.log('OTP codes expired');
        throw new BadRequestException('OTP codes have expired');
      }

      // Verify email OTP
      if (user.emailOtp !== verifyOtpDto.emailCode) {
        console.log('Invalid email OTP:', {
          expected: user.emailOtp,
          received: verifyOtpDto.emailCode,
        });
        throw new BadRequestException('Invalid email verification code');
      }

      // Verify phone OTP
      if (user.phoneOtp !== verifyOtpDto.phoneCode) {
        console.log('Invalid phone OTP:', {
          expected: user.phoneOtp,
          received: verifyOtpDto.phoneCode,
        });
        throw new BadRequestException('Invalid phone verification code');
      }

      // Mark as verified and clear OTP codes
      (user as UserDocument).emailVerified = true;
      (user as UserDocument).phoneVerified = true;
      (user as UserDocument).emailOtp = undefined;
      (user as UserDocument).phoneOtp = undefined;
      (user as UserDocument).emailOtpExpires = undefined;
      (user as UserDocument).phoneOtpExpires = undefined;
      await (user as UserDocument).save();

      return { message: 'Verification successful' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Verification failed');
    }
  }

  /**
   * Resend OTP code
   */
  async resendOtp(
    resendOtpDto: ResendOtpDto,
    req?: Request,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userService.findByEmail(resendOtpDto.email, true);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      if (resendOtpDto.type === 'email') {
        (user as UserDocument).emailOtp = otp;
        (user as UserDocument).emailOtpExpires = expiryDate;
        await (user as UserDocument).save();

        const message = `Your email verification code is: ${otp}. This code will expire in 10 minutes.`;
        await this.notificationService.sendRegistrationPassword(
          user.email,
          message,
        );
      } else if (resendOtpDto.type === 'phone') {
        (user as UserDocument).phoneOtp = otp;
        (user as UserDocument).phoneOtpExpires = expiryDate;
        await (user as UserDocument).save();

        const message = `Your phone verification code is: ${otp}. This code will expire in 10 minutes.`;
        // Send only to phone via SMS
        if (user.phoneNumber) {
          await this.notificationService.sendSMS(user.phoneNumber, message);
        }
      }

      return { message: 'OTP code resent successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to resend OTP');
    }
  }
}
