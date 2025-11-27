import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Indicator, IndicatorDocument } from '../schemas/indicator.schema';
import {
  CreateIndicatorDto,
  AddMeasurementDto,
  UpdateIndicatorDto,
} from '../dto/create-indicator.dto';

@Injectable()
export class IndicatorsService {
  constructor(
    @InjectModel(Indicator.name)
    private indicatorModel: Model<IndicatorDocument>,
  ) {}

  async create(
    createIndicatorDto: CreateIndicatorDto,
    userId: string,
  ): Promise<IndicatorDocument> {
    // Check if code already exists
    const existing = await this.indicatorModel
      .findOne({ code: createIndicatorDto.code })
      .exec();
    if (existing) {
      throw new BadRequestException(
        `Indicator with code ${createIndicatorDto.code} already exists`,
      );
    }

    const indicator = new this.indicatorModel({
      ...createIndicatorDto,
      measurements: [],
      createdBy: userId,
    });

    return indicator.save();
  }

  async findAll(): Promise<IndicatorDocument[]> {
    return this.indicatorModel
      .find({ deletedAt: null })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProject(projectId: string): Promise<IndicatorDocument[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    return this.indicatorModel
      .find({ projectId: new Types.ObjectId(projectId), deletedAt: null })
      .exec();
  }

  async findOne(id: string): Promise<IndicatorDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid indicator ID');
    }

    const indicator = await this.indicatorModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!indicator) {
      throw new NotFoundException(`Indicator with ID ${id} not found`);
    }

    return indicator;
  }

  async update(
    id: string,
    updateIndicatorDto: UpdateIndicatorDto,
    userId: string,
  ): Promise<IndicatorDocument> {
    const indicator = await this.findOne(id);

    Object.assign(indicator, updateIndicatorDto, { updatedBy: userId });
    return indicator.save();
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const indicator = await this.findOne(id);

    indicator.deletedAt = new Date();
    indicator.updatedBy = userId;
    await indicator.save();

    return { message: 'Indicator deleted successfully' };
  }

  async addMeasurement(
    id: string,
    measurementDto: AddMeasurementDto,
    userId: string,
  ): Promise<IndicatorDocument> {
    const indicator = await this.findOne(id);

    const measurement: any = {
      id: new Types.ObjectId().toString(),
      value: measurementDto.value,
      date: measurementDto.date,
      dataQuality: measurementDto.dataQuality || 'unverified',
      collectedBy: userId,
      notes: measurementDto.notes,
      attachments: measurementDto.attachments,
    };

    // Convert disaggregatedData to Map if provided
    if (measurementDto.disaggregatedData) {
      measurement.disaggregatedData = new Map(
        Object.entries(measurementDto.disaggregatedData),
      );
    }

    indicator.measurements.push(measurement);
    indicator.updatedBy = userId;

    return indicator.save();
  }
}
