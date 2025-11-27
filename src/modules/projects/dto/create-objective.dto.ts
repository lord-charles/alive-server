import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  OBJECTIVE_TYPES,
  OBJECTIVE_STATUS,
} from '../constants/projects.constants';

export class CreateObjectiveDto {
  @ApiProperty({ description: 'Reference to parent project' })
  @IsNotEmpty({ message: 'Project ID is required' })
  @IsString()
  projectId: string;

  @ApiProperty({
    description: 'Objective title',
    example: 'Improve Collaboration Skills Among Primary School Children',
  })
  @IsNotEmpty({ message: 'Objective title is required' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed objective description' })
  @IsNotEmpty({ message: 'Objective description is required' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Objective type in results framework',
    enum: OBJECTIVE_TYPES,
    example: 'outcome',
  })
  @IsNotEmpty({ message: 'Objective type is required' })
  @IsEnum(OBJECTIVE_TYPES)
  type: string;

  @ApiProperty({
    description: 'Parent objective ID for hierarchical structure',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentObjectiveId?: string;

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
    description: 'Related activity IDs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities?: string[];

  @ApiProperty({ description: 'Objective start date', example: '2024-01-15' })
  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Objective end date', example: '2025-12-31' })
  @IsNotEmpty({ message: 'End date is required' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: 'Objective status',
    enum: OBJECTIVE_STATUS,
    example: 'not-started',
    default: 'not-started',
  })
  @IsOptional()
  @IsEnum(OBJECTIVE_STATUS)
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

  @ApiProperty({ description: 'Display order', example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}
