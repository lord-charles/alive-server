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
import { FormsService } from '../services/forms.service';
import {
  CreateFormDto,
  UpdateFormDto,
  SubmitFormResponseDto,
  VerifyResponseDto,
} from '../dto/create-form.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { User, UserDocument } from '../../auth/schemas/user.schema';

@ApiTags('Forms')
@Controller('forms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new data collection form' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Form created successfully',
  })
  async createForm(
    @Body() createFormDto: CreateFormDto,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.formsService.createForm(createFormDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forms' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All forms retrieved successfully',
  })
  async findAll() {
    return this.formsService.findAll();
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all forms for a project' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Forms retrieved successfully',
  })
  async findAllForms(@Param('projectId') projectId: string) {
    return this.formsService.findAllForms(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form retrieved successfully',
  })
  async findOneForm(@Param('id') id: string) {
    return this.formsService.findOneForm(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update form' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form updated successfully',
  })
  async updateForm(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.formsService.updateForm(id, updateFormDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete form' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form deleted successfully',
  })
  async deleteForm(
    @Param('id') id: string,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.formsService.deleteForm(id, userId);
  }

  @Post(':id/responses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit form response' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Response submitted successfully',
  })
  async submitResponse(
    @Param('id') id: string,
    @Body() responseDto: SubmitFormResponseDto,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.formsService.submitResponse(id, responseDto, userId);
  }

  @Get(':id/responses')
  @ApiOperation({ summary: 'Get all responses for a form' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Responses retrieved successfully',
  })
  async findAllResponses(@Param('id') id: string) {
    return this.formsService.findAllResponses(id);
  }

  @Patch('responses/:responseId/verify')
  @ApiOperation({ summary: 'Verify or reject form response' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Response verification updated',
  })
  async verifyResponse(
    @Param('responseId') responseId: string,
    @Body() verifyDto: VerifyResponseDto,
    @Req() req: ExpressRequest & { user: User | UserDocument },
  ) {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    return this.formsService.verifyResponse(responseId, verifyDto, userId);
  }
}
