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
  IsEmail,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SECTORS,
  COUNTRIES,
  PROJECT_STATUS,
  PROJECT_PRIORITY,
  FUNDING_TYPES,
  STAKEHOLDER_TYPES,
} from '../constants/projects.constants';

// Nested DTOs for embedded objects
export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude', example: -1.286389 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: 36.817223 })
  @IsNumber()
  longitude: number;
}

export class ProjectLocationDto {
  @ApiProperty({ description: 'Country name', example: 'Kenya' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(COUNTRIES)
  country: string;

  @ApiProperty({
    description: 'Region or state',
    example: 'Central Region',
    required: false,
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({
    description: 'District or county',
    example: 'Nairobi County',
    required: false,
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({
    description: 'Geographic coordinates',
    required: false,
    example: { latitude: -1.286389, longitude: 36.817223 },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

export class FundingSourceDto {
  @ApiProperty({ description: 'Funding source name', example: 'USAID Grant' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Funding amount', example: 250000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Type of funding',
    enum: FUNDING_TYPES,
    example: 'grant',
  })
  @IsNotEmpty()
  @IsEnum(FUNDING_TYPES)
  type: string;
}

export class ProjectBudgetDto {
  @ApiProperty({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'List of funding sources',
    type: [FundingSourceDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one funding source is required' })
  @ValidateNested({ each: true })
  @Type(() => FundingSourceDto)
  fundingSources: FundingSourceDto[];
}

export class StakeholderDto {
  @ApiProperty({
    description: 'Stakeholder name',
    example: 'Ministry of Education',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role in project',
    example: 'Government Partner',
  })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ description: 'Organization name', required: false })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Type of stakeholder',
    enum: STAKEHOLDER_TYPES,
    example: 'government',
  })
  @IsNotEmpty()
  @IsEnum(STAKEHOLDER_TYPES)
  type: string;
}

// Main Create Project DTO
export class CreateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'ALiVE Kenya - Lifeskills Assessment Program',
  })
  @IsNotEmpty({ message: 'Project title is required' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed project description',
    example:
      'Comprehensive assessment of 21st century competencies among children and youth across 47 counties in Kenya',
  })
  @IsNotEmpty({ message: 'Project description is required' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Project sector',
    enum: SECTORS,
    example: 'Education',
  })
  @IsNotEmpty({ message: 'Project sector is required' })
  @IsEnum(SECTORS)
  sector: string;

  @ApiProperty({ description: 'Project location', type: ProjectLocationDto })
  @IsNotEmpty({ message: 'Project location is required' })
  @ValidateNested()
  @Type(() => ProjectLocationDto)
  location: ProjectLocationDto;

  @ApiProperty({ description: 'Project start date', example: '2024-01-15' })
  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Project end date', example: '2025-12-31' })
  @IsNotEmpty({ message: 'End date is required' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: 'Project status',
    enum: PROJECT_STATUS,
    example: 'planning',
    default: 'planning',
  })
  @IsOptional()
  @IsEnum(PROJECT_STATUS)
  status?: string;

  @ApiProperty({
    description: 'Project priority',
    enum: PROJECT_PRIORITY,
    example: 'medium',
    default: 'medium',
  })
  @IsOptional()
  @IsEnum(PROJECT_PRIORITY)
  priority?: string;

  @ApiProperty({ description: 'Project budget', type: ProjectBudgetDto })
  @IsNotEmpty({ message: 'Project budget is required' })
  @ValidateNested()
  @Type(() => ProjectBudgetDto)
  budget: ProjectBudgetDto;

  @ApiProperty({
    description: 'Project stakeholders',
    type: [StakeholderDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StakeholderDto)
  stakeholders?: StakeholderDto[];

  @ApiProperty({
    description: 'Project tags for categorization',
    type: [String],
    example: ['lifeskills', 'assessment', 'education'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
