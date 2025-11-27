import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LogFrameService } from '../services/logframe.service';
import { CreateLogFrameDto } from '../dto/create-logframe.dto';
import { UpdateLogFrameDto } from '../dto/update-logframe.dto';

@ApiTags('logframes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logframes')
export class LogFrameController {
  constructor(private readonly logFrameService: LogFrameService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log frame' })
  create(@Body() createLogFrameDto: CreateLogFrameDto) {
    return this.logFrameService.create(createLogFrameDto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get log frame for a project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.logFrameService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get log frame by ID' })
  findOne(@Param('id') id: string) {
    return this.logFrameService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a log frame' })
  update(
    @Param('id') id: string,
    @Body() updateLogFrameDto: UpdateLogFrameDto,
  ) {
    return this.logFrameService.update(id, updateLogFrameDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a log frame' })
  remove(@Param('id') id: string) {
    return this.logFrameService.remove(id);
  }
}
