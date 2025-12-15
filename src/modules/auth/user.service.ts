import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
} from './dto/user.dto';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
import { NotificationService } from '../notifications/services/notification.service';
import { SystemLogsService } from '../system-logs/services/system-logs.service';
import { Request } from 'express';
import { UserFilterDto } from './dto/filter.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly systemLogsService: SystemLogsService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { phoneNumber: createUserDto.phoneNumber },
        { nationalId: createUserDto.nationalId },
      ],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with provided details already exists',
      );
    }

    const { roles, ...userData } = createUserDto;

    const newUser = new this.userModel({
      ...userData,
      roles: Array.isArray(roles) && roles.length > 0 ? roles : ['employee'],
    });

    const savedUser = await newUser.save();

    return savedUser;
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ token: string; user: User }> {
    const user = await this.userModel
      .findOne({ email: loginUserDto.email })
      .select('+password');

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user };
  }

  async findAll(filterDto: UserFilterDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, search, page = 1, limit = 10 } = filterDto;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await this.userModel.countDocuments(query);
    const users = await this.userModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return { users, total, page, limit };
  }

  async basicInfo(): Promise<{ users: User[] }> {
    try {
      const users = await this.userModel
        .find()
        .select('firstName lastName email phoneNumber nationalId')
        .exec();
      return { users };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }
  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(
    email: string,
    selectSensitive: boolean = false,
  ): Promise<UserDocument | null> {
    let query = this.userModel.findOne({ email });
    if (selectSensitive) {
      query = query.select(
        '+password +resetPasswordPin +resetPasswordExpires +emailOtp +phoneOtp +emailOtpExpires +phoneOtpExpires',
      );
    }
    const user = await query.exec();
    if (!user) {
      throw new NotFoundException(` User with email ${email} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    req?: Request,
  ): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );
    if (!updatedUser) throw new NotFoundException('User not found');

    return updatedUser;
  }

  async remove(id: string, req?: Request): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
  }

  async createByAdmin(
    createUserDto: CreateUserDto,
    req?: Request,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { phoneNumber: createUserDto.phoneNumber },
        { nationalId: createUserDto.nationalId },
      ],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with provided details already exists',
      );
    }

    // Generate a temporary password
    const tempPassword = this.generateTempPassword();

    const { roles, ...userData } = createUserDto;
    const newUser = new this.userModel({
      ...userData,
      password: tempPassword,
      roles: Array.isArray(roles) && roles.length > 0 ? roles : ['employee'],
      emailVerified: true, // Admin created users are pre-verified
      phoneVerified: true,
    });

    const savedUser = await newUser.save();

    // Send credentials via SMS
    try {
      await this.sendCredentialsSMS(savedUser, tempPassword);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      // Don't fail user creation if SMS fails
    }

    return savedUser;
  }

  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, inactiveUsers, newUsersThisMonth] =
      await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ status: 'active' }),
        this.userModel.countDocuments({ status: { $ne: 'active' } }),
        this.userModel.countDocuments({
          createdAt: { $gte: startOfMonth },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
    };
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password + '!';
  }

  async bulkUpdateStatus(
    userIds: string[],
    status: string,
    req?: Request,
  ): Promise<{ updated: number }> {
    const result = await this.userModel.updateMany(
      { _id: { $in: userIds } },
      { status },
    );

    return { updated: result.modifiedCount };
  }

  async bulkDelete(
    userIds: string[],
    req?: Request,
  ): Promise<{ deleted: number }> {
    const result = await this.userModel.deleteMany({
      _id: { $in: userIds },
    });

    return { deleted: result.deletedCount };
  }

  private async sendCredentialsSMS(
    user: User,
    password: string,
  ): Promise<void> {
    const message = `Welcome to Alive! Your login credentials:\nEmail: ${user.email}\nPassword: ${password}\nPlease change your password after first login.`;

    // Use the notification service to send SMS
    await this.notificationService.sendSMS(user.phoneNumber, message);
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    req?: Request,
  ): Promise<{ message: string }> {
    const user = await this.userModel
      .findById(updatePasswordDto.userId)
      .select('+password');

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(updatePasswordDto.currentPassword, user.password))
    ) {
      if (user) {
        throw new BadRequestException('Invalid current password');
      }

      user.password = updatePasswordDto.newPassword;
      await user.save();

      return { message: 'Password updated successfully' };
    }
  }
}
