import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IndicatorsService } from '../services/indicators.service';
import {
  CreateIndicatorDto,
  UpdateIndicatorDto,
  AddMeasurementDto,
} from '../dto/create-indicator.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { User, UserDocument } from '../../auth/schemas/user.schema';

@ApiTags('Indicators')
@Controller('indicators')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new indicator' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Indicator created successfully',
  })
  async create(
    @Body() createIndicatorDto: CreateIndicatorDto,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.indicatorsService.create(createIndicatorDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all indicators' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All indicators retrieved successfully',
  })
  async findAll() {
    return this.indicatorsService.findAll();
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all indicators for a project' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Indicators retrieved successfully',
  })
  async findByProject(@Param('projectId') projectId: string) {
    return this.indicatorsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get indicator by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Indicator retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.indicatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update indicator' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Indicator updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateIndicatorDto: UpdateIndicatorDto,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.indicatorsService.update(id, updateIndicatorDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete indicator' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Indicator deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.indicatorsService.delete(id, userId);
  }

  @Post(':id/measurements')
  @ApiOperation({ summary: 'Add measurement to indicator' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Measurement added successfully',
  })
  async addMeasurement(
    @Param('id') id: string,
    @Body() measurementDto: AddMeasurementDto,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.indicatorsService.addMeasurement(id, measurementDto, userId);
  }
}
