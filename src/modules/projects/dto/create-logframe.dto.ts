import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RISK_LEVELS, RISK_STATUS } from '../constants/projects.constants';

export class LogFrameOutputDto {
  @ApiProperty({
    description: 'Output description',
    example:
      'Comprehensive lifeskills assessments conducted across 47 counties',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

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

  @ApiProperty({ description: 'Display order', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}

export class RiskDto {
  @ApiProperty({
    description: 'Risk description',
    example: 'Political instability affecting project implementation',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Risk level',
    enum: RISK_LEVELS,
    example: 'medium',
  })
  @IsNotEmpty()
  @IsEnum(RISK_LEVELS)
  level: string;

  @ApiProperty({ description: 'Mitigation strategy' })
  @IsNotEmpty()
  @IsString()
  mitigation: string;

  @ApiProperty({
    description: 'Risk status',
    enum: RISK_STATUS,
    example: 'identified',
    default: 'identified',
  })
  @IsOptional()
  @IsEnum(RISK_STATUS)
  status?: string;
}

export class CreateLogFrameDto {
  @ApiProperty({ description: 'Reference to parent project' })
  @IsNotEmpty({ message: 'Project ID is required' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Overall goal (impact level)' })
  @IsNotEmpty({ message: 'Goal is required' })
  @IsString()
  goal: string;

  @ApiProperty({ description: 'Project purpose (outcome level)' })
  @IsNotEmpty({ message: 'Purpose is required' })
  @IsString()
  purpose: string;

  @ApiProperty({
    description: 'Project outputs',
    type: [LogFrameOutputDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogFrameOutputDto)
  outputs?: LogFrameOutputDto[];

  @ApiProperty({
    description: 'Key assumptions',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assumptions?: string[];

  @ApiProperty({
    description: 'Risk register',
    type: [RiskDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskDto)
  risks?: RiskDto[];
}

export class UpdateLogFrameDto {
  @ApiProperty({ description: 'Overall goal', required: false })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({ description: 'Project purpose', required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({
    description: 'Project outputs',
    type: [LogFrameOutputDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogFrameOutputDto)
  outputs?: LogFrameOutputDto[];

  @ApiProperty({
    description: 'Key assumptions',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assumptions?: string[];

  @ApiProperty({
    description: 'Risk register',
    type: [RiskDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskDto)
  risks?: RiskDto[];
}
