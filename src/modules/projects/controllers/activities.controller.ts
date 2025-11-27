import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ActivitiesService } from '../services/activities.service';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  create(@Body() createActivityDto: CreateActivityDto, @Req() req: any) {
    const userId = req.user?._id?.toString() || req.user?.id;
    return this.activitiesService.create({
      ...createActivityDto,
      createdBy: userId,
    } as any);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  findAll(@Query() query: any) {
    return this.activitiesService.findAll(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all activities for a project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.activitiesService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity' })
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update activity status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.activitiesService.updateStatus(id, status as any);
  }
}
