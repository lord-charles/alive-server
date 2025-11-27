import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ACTIVITY_TYPES,
  ACTIVITY_STATUS,
  MILESTONE_STATUS,
} from '../constants/projects.constants';

export class ActivityParticipantDto {
  @ApiProperty({
    description: 'Participant name',
    example: 'Assessment Team A',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Role in activity', example: 'Data Collectors' })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ description: 'Organization', required: false })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ description: 'Attendance status', required: false })
  @IsOptional()
  @IsBoolean()
  attended?: boolean;
}

export class MilestoneDto {
  @ApiProperty({
    description: 'Milestone title',
    example: 'Training of assessors completed',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Due date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @ApiProperty({
    description: 'Milestone status',
    enum: MILESTONE_STATUS,
    example: 'pending',
    default: 'pending',
  })
  @IsOptional()
  @IsEnum(MILESTONE_STATUS)
  status?: string;

  @ApiProperty({ description: 'Completion date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedDate?: Date;
}

export class ActivityBudgetDto {
  @ApiProperty({ description: 'Allocated budget', example: 15000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  allocated: number;

  @ApiProperty({ description: 'Amount spent', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  spent?: number;
}

export class CreateActivityDto {
  @ApiProperty({ description: 'Reference to parent project' })
  @IsNotEmpty({ message: 'Project ID is required' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Reference to objective', required: false })
  @IsOptional()
  @IsString()
  objectiveId?: string;

  @ApiProperty({
    description: 'Activity title',
    example: 'Baseline Lifeskills Assessment - Nairobi County',
  })
  @IsNotEmpty({ message: 'Activity title is required' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed activity description' })
  @IsNotEmpty({ message: 'Activity description is required' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Activity type',
    enum: ACTIVITY_TYPES,
    example: 'assessment',
  })
  @IsNotEmpty({ message: 'Activity type is required' })
  @IsEnum(ACTIVITY_TYPES)
  type: string;

  @ApiProperty({ description: 'Activity start date', example: '2024-02-01' })
  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Activity end date', example: '2024-02-28' })
  @IsNotEmpty({ message: 'End date is required' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: 'Activity status',
    enum: ACTIVITY_STATUS,
    example: 'planned',
    default: 'planned',
  })
  @IsOptional()
  @IsEnum(ACTIVITY_STATUS)
  status?: string;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiProperty({
    description: 'Activity location',
    example: 'Nairobi County, Kenya',
  })
  @IsNotEmpty({ message: 'Location is required' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Responsible person' })
  @IsNotEmpty({ message: 'Responsible person is required' })
  @IsString()
  responsiblePerson: string;

  @ApiProperty({
    description: 'Activity participants',
    type: [ActivityParticipantDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityParticipantDto)
  participants?: ActivityParticipantDto[];

  @ApiProperty({ description: 'Activity budget', type: ActivityBudgetDto })
  @IsNotEmpty({ message: 'Budget is required' })
  @ValidateNested()
  @Type(() => ActivityBudgetDto)
  budget: ActivityBudgetDto;

  @ApiProperty({
    description: 'Expected outputs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outputs?: string[];

  @ApiProperty({
    description: 'Related indicator IDs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  indicators?: string[];

  @ApiProperty({
    description: 'Related form IDs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forms?: string[];

  @ApiProperty({
    description: 'Activity milestones',
    type: [MilestoneDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @ApiProperty({
    description: 'Dependent activity IDs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];
}

export class UpdateActivityDto {
  @ApiProperty({ description: 'Activity title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Activity description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Activity status',
    enum: ACTIVITY_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(ACTIVITY_STATUS)
  status?: string;

  @ApiProperty({ description: 'Progress percentage (0-100)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiProperty({
    description: 'Activity budget',
    type: ActivityBudgetDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityBudgetDto)
  budget?: ActivityBudgetDto;

  @ApiProperty({
    description: 'Activity participants',
    type: [ActivityParticipantDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityParticipantDto)
  participants?: ActivityParticipantDto[];

  @ApiProperty({
    description: 'Activity milestones',
    type: [MilestoneDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];
}
