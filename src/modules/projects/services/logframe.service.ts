import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogFrame } from '../schemas/logframe.schema';
import { CreateLogFrameDto } from '../dto/create-logframe.dto';
import { UpdateLogFrameDto } from '../dto/update-logframe.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LogFrameService {
  constructor(
    @InjectModel(LogFrame.name)
    private logFrameModel: Model<LogFrame>,
  ) {}

  async create(createLogFrameDto: CreateLogFrameDto): Promise<LogFrame> {
    // Generate IDs for outputs and risks
    const outputs = (createLogFrameDto.outputs || []).map((output, index) => ({
      ...output,
      id: uuidv4(),
      order: output.order || index + 1,
    }));

    const risks = (createLogFrameDto.risks || []).map((risk) => ({
      ...risk,
      id: uuidv4(),
      status: risk.status || 'identified',
    }));

    const logFrame = new this.logFrameModel({
      ...createLogFrameDto,
      outputs,
      assumptions: createLogFrameDto.assumptions || [],
      risks,
      createdBy: 'system', // TODO: Get from auth context
    });
    return logFrame.save();
  }

  async findByProject(projectId: string): Promise<LogFrame | null> {
    return this.logFrameModel.findOne({ projectId }).exec();
  }

  async findOne(id: string): Promise<LogFrame> {
    const logFrame = await this.logFrameModel.findById(id).exec();
    if (!logFrame) {
      throw new NotFoundException(`LogFrame with ID ${id} not found`);
    }
    return logFrame;
  }

  async update(
    id: string,
    updateLogFrameDto: UpdateLogFrameDto,
  ): Promise<LogFrame> {
    // Generate IDs for new outputs and risks if they don't have them
    const outputs = updateLogFrameDto.outputs
      ? updateLogFrameDto.outputs.map((output, index) => ({
          ...output,
          id: uuidv4(),
          order: output.order || index + 1,
        }))
      : undefined;

    const risks = updateLogFrameDto.risks
      ? updateLogFrameDto.risks.map((risk) => ({
          ...risk,
          id: uuidv4(),
          status: risk.status || 'identified',
        }))
      : undefined;

    const updateData: any = {
      ...updateLogFrameDto,
      updatedAt: new Date(),
      updatedBy: 'system', // TODO: Get from auth context
    };

    if (outputs) updateData.outputs = outputs;
    if (risks) updateData.risks = risks;

    const logFrame = await this.logFrameModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!logFrame) {
      throw new NotFoundException(`LogFrame with ID ${id} not found`);
    }

    return logFrame;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.logFrameModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`LogFrame with ID ${id} not found`);
    }
    return { message: 'LogFrame deleted successfully' };
  }
}
