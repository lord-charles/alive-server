import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserFilterDto } from './dto/filter.dto';
import { Request } from 'express';
import { NotificationService } from '../notifications/services/notification.service';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  // @Roles('admin', 'hr')
  @Get('/users')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all employees',
    description:
      'Returns paginated list of employees. All filters are optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
  })
  async findAll(@Query() filterDto: UserFilterDto, @Req() req: Request) {
    const { status, page = 1, limit = 10 } = filterDto;
    return this.userService.findAll({
      status,
      page,
      limit,
    });
  }

  // @Roles('admin', 'hr')
  @Post('/users')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new employee (Admin only)',
    description: 'Create a new employee account and send credentials via SMS',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or user already exists',
  })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    return this.userService.createByAdmin(createUserDto, req);
  }

  // @Roles('admin', 'hr')
  @Get('/users/statistics')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Returns user statistics for dashboard cards',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics() {
    return this.userService.getStatistics();
  }

  // @Roles('admin')
  @Patch('/users/bulk-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update user status',
    description: 'Update status for multiple users at once',
  })
  async bulkUpdateStatus(
    @Body() bulkUpdateDto: { userIds: string[]; status: string },
    @Req() req: Request,
  ) {
    return this.userService.bulkUpdateStatus(
      bulkUpdateDto.userIds,
      bulkUpdateDto.status,
      req,
    );
  }

  // @Roles('admin')
  @Delete('/users/bulk')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Bulk delete users',
    description: 'Delete multiple users at once',
  })
  async bulkDelete(
    @Body() bulkDeleteDto: { userIds: string[] },
    @Req() req: Request,
  ) {
    return this.userService.bulkDelete(bulkDeleteDto.userIds, req);
  }

  @Get('/users/basic-info')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all employees',
    description:
      'Returns paginated list of employees. All filters are optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
  })
  async basicInfo() {
    return this.userService.basicInfo();
  }

  // Get user by ID - Returns detailed user information
  @Get('/user/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get employee by ID',
    description: 'Returns detailed information about a specific employee',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee details retrieved successfully',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  // Update user details
  // @Roles('admin', 'hr')
  @Patch('/user/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update employee details',
    description:
      'Update employee information including personal and employment details',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.userService.update(id, updateUserDto, req);
  }

  // Delete user
  // @Roles('admin')
  @Delete('/user/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete employee',
    description: 'Permanently removes employee from the system',
  })
  @ApiResponse({
    status: 204,
    description: 'Employee deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.userService.remove(id, req);
  }
}
