import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john@company.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+254712345678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Email verification code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Email code must be exactly 6 digits' })
  emailCode: string;

  @ApiProperty({
    description: 'Phone verification code',
    example: '654321',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Phone code must be exactly 6 digits' })
  phoneCode: string;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john@company.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+254712345678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Type of OTP to resend',
    example: 'email',
    enum: ['email', 'phone'],
  })
  @IsString()
  @IsNotEmpty()
  type: 'email' | 'phone';
}
