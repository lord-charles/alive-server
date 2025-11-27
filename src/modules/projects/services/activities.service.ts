import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from '../schemas/activity.schema';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = new this.activityModel({
      ...createActivityDto,
      status: createActivityDto.status || 'planned',
      participants: createActivityDto.participants || [],
      milestones: createActivityDto.milestones || [],
      dependencies: createActivityDto.dependencies || [],
    });
    return activity.save();
  }

  async findAll(query: any = {}): Promise<Activity[]> {
    const filter: any = {};

    if (query.projectId) {
      filter.projectId = query.projectId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.type) {
      filter.type = query.type;
    }

    return this.activityModel.find(filter).sort({ startDate: 1 }).exec();
  }

  async findByProject(projectId: string): Promise<Activity[]> {
    return this.activityModel.find({ projectId }).sort({ startDate: 1 }).exec();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityModel.findById(id).exec();
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    const activity = await this.activityModel
      .findByIdAndUpdate(
        id,
        { ...updateActivityDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.activityModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return { message: 'Activity deleted successfully' };
  }

  async updateStatus(
    id: string,
    status: 'planned' | 'in-progress' | 'completed' | 'cancelled',
  ): Promise<Activity> {
    const activity = await this.activityModel
      .findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true })
      .exec();

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }
}
