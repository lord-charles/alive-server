import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import {
  ProjectActivity,
  ProjectActivityDocument,
} from '../schemas/project-activity.schema';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { QueryParamsDto } from '../dto/query-params.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectActivity.name)
    private projectActivityModel: Model<ProjectActivityDocument>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    // Validate dates
    if (
      new Date(createProjectDto.endDate) <= new Date(createProjectDto.startDate)
    ) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate total budget from funding sources
    const totalBudget = createProjectDto.budget.fundingSources.reduce(
      (sum, source) => sum + source.amount,
      0,
    );

    // Generate unique IDs for funding sources and stakeholders
    const fundingSources = createProjectDto.budget.fundingSources.map(
      (source) => ({
        ...source,
        id: new Types.ObjectId().toString(),
      }),
    );

    const stakeholders =
      createProjectDto.stakeholders?.map((stakeholder) => ({
        ...stakeholder,
        id: new Types.ObjectId().toString(),
      })) || [];

    // Create project
    const project = new this.projectModel({
      ...createProjectDto,
      budget: {
        ...createProjectDto.budget,
        total: totalBudget,
        spent: 0,
        fundingSources,
      },
      stakeholders,
      createdBy: userId,
    });

    const savedProject = await project.save();

    // Log activity
    await this.logActivity(
      savedProject._id as Types.ObjectId,
      'created',
      'Project created and initialized',
      userId,
    );

    return savedProject;
  }

  async findAll(queryParams: QueryParamsDto): Promise<{
    data: ProjectDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      search,
      status,
      sector,
      country,
      priority,
    } = queryParams;

    const filter: any = { deletedAt: null };

    // Apply filters
    if (status) filter.status = status;
    if (sector) filter.sector = sector;
    if (country) filter['location.country'] = country;
    if (priority) filter.priority = priority;

    // Apply search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    const project = await this.findOne(id);

    // Validate dates if provided
    const startDate = updateProjectDto.startDate || project.startDate;
    const endDate = updateProjectDto.endDate || project.endDate;

    if (new Date(endDate) <= new Date(startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Recalculate budget if funding sources changed
    if (updateProjectDto.budget?.fundingSources) {
      const totalBudget = updateProjectDto.budget.fundingSources.reduce(
        (sum, source) => sum + source.amount,
        0,
      );

      const fundingSources = updateProjectDto.budget.fundingSources.map(
        (source: any) => ({
          ...source,
          id: source.id || new Types.ObjectId().toString(),
        }),
      );

      (updateProjectDto.budget as any).total = totalBudget;
      (updateProjectDto.budget as any).fundingSources = fundingSources;
    }

    // Generate IDs for new stakeholders
    if (updateProjectDto.stakeholders) {
      updateProjectDto.stakeholders = updateProjectDto.stakeholders.map(
        (stakeholder: any) => ({
          ...stakeholder,
          id: stakeholder.id || new Types.ObjectId().toString(),
        }),
      );
    }

    // Update project
    Object.assign(project, updateProjectDto, { updatedBy: userId });
    const updatedProject = await project.save();

    // Log activity
    await this.logActivity(
      project._id as Types.ObjectId,
      'updated',
      'Project information updated',
      userId,
    );

    return updatedProject;
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const project = await this.findOne(id);

    // Soft delete
    project.deletedAt = new Date();
    project.updatedBy = userId;
    await project.save();

    // Log activity
    await this.logActivity(
      project._id as Types.ObjectId,
      'updated',
      'Project deleted',
      userId,
    );

    return { message: 'Project deleted successfully' };
  }

  async getStatistics(id: string): Promise<any> {
    const project = await this.findOne(id);

    const budgetUtilization =
      project.budget.total > 0
        ? Math.round((project.budget.spent / project.budget.total) * 100)
        : 0;

    const now = new Date();
    const totalDays = Math.ceil(
      (new Date(project.endDate).getTime() -
        new Date(project.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const elapsedDays = Math.ceil(
      (now.getTime() - new Date(project.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const daysRemaining = Math.ceil(
      (new Date(project.endDate).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const timeProgress =
      totalDays > 0
        ? Math.min(Math.round((elapsedDays / totalDays) * 100), 100)
        : 0;

    return {
      budget: {
        total: project.budget.total,
        spent: project.budget.spent,
        remaining: project.budget.total - project.budget.spent,
        utilization: budgetUtilization,
        currency: project.budget.currency,
      },
      timeline: {
        startDate: project.startDate,
        endDate: project.endDate,
        totalDays,
        elapsedDays,
        daysRemaining,
        timeProgress,
      },
      stakeholders: {
        total: project.stakeholders.length,
        byType: this.groupByType(project.stakeholders),
      },
      fundingSources: {
        total: project.budget.fundingSources.length,
        byType: this.groupFundingByType(project.budget.fundingSources),
      },
    };
  }

  async getTimeline(id: string): Promise<ProjectActivityDocument[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    return this.projectActivityModel
      .find({ projectId: new Types.ObjectId(id) })
      .sort({ timestamp: -1 })
      .limit(50)
      .exec();
  }

  private async logActivity(
    projectId: Types.ObjectId,
    type: string,
    description: string,
    performedBy: string,
  ): Promise<void> {
    const activity = new this.projectActivityModel({
      projectId,
      type,
      description,
      performedBy,
      timestamp: new Date(),
    });

    await activity.save();
  }

  private groupByType(items: any[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
  }

  private groupFundingByType(fundingSources: any[]): Record<string, number> {
    return fundingSources.reduce((acc, source) => {
      acc[source.type] = (acc[source.type] || 0) + source.amount;
      return acc;
    }, {});
  }
}
