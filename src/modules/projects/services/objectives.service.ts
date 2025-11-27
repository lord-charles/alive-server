import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Objective } from '../schemas/objective.schema';
import { CreateObjectiveDto } from '../dto/create-objective.dto';
import { UpdateObjectiveDto } from '../dto/update-objective.dto';

@Injectable()
export class ObjectivesService {
  constructor(
    @InjectModel(Objective.name)
    private objectiveModel: Model<Objective>,
  ) {}

  async create(createObjectiveDto: CreateObjectiveDto): Promise<Objective> {
    const objective = new this.objectiveModel({
      ...createObjectiveDto,
      progress: 0,
      status: createObjectiveDto.status || 'not-started',
      indicators: [],
      activities: [],
    });
    return objective.save();
  }

  async findAll(query: any = {}): Promise<Objective[]> {
    const filter: any = {};

    if (query.projectId) {
      filter.projectId = query.projectId;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.status) {
      filter.status = query.status;
    }

    return this.objectiveModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByProject(projectId: string): Promise<Objective[]> {
    return this.objectiveModel
      .find({ projectId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Objective> {
    const objective = await this.objectiveModel.findById(id).exec();
    if (!objective) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }
    return objective;
  }

  async update(
    id: string,
    updateObjectiveDto: UpdateObjectiveDto,
  ): Promise<Objective> {
    const objective = await this.objectiveModel
      .findByIdAndUpdate(
        id,
        { ...updateObjectiveDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!objective) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }

    return objective;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.objectiveModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }
    return { message: 'Objective deleted successfully' };
  }

  async updateProgress(id: string, progress: number): Promise<Objective> {
    const objective = await this.objectiveModel
      .findByIdAndUpdate(id, { progress, updatedAt: new Date() }, { new: true })
      .exec();

    if (!objective) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }

    return objective;
  }
}
