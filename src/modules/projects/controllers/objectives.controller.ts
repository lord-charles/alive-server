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
import { ObjectivesService } from '../services/objectives.service';
import { CreateObjectiveDto } from '../dto/create-objective.dto';
import { UpdateObjectiveDto } from '../dto/update-objective.dto';

@ApiTags('objectives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new objective' })
  create(@Body() createObjectiveDto: CreateObjectiveDto, @Req() req: any) {
    const userId = req.user?._id?.toString() || req.user?.id;
    return this.objectivesService.create({
      ...createObjectiveDto,
      createdBy: userId,
    } as any);
  }

  @Get()
  @ApiOperation({ summary: 'Get all objectives' })
  findAll(@Query() query: any) {
    return this.objectivesService.findAll(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all objectives for a project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.objectivesService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get objective by ID' })
  findOne(@Param('id') id: string) {
    return this.objectivesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an objective' })
  update(
    @Param('id') id: string,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    return this.objectivesService.update(id, updateObjectiveDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an objective' })
  remove(@Param('id') id: string) {
    return this.objectivesService.remove(id);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update objective progress' })
  updateProgress(@Param('id') id: string, @Body('progress') progress: number) {
    return this.objectivesService.updateProgress(id, progress);
  }
}
