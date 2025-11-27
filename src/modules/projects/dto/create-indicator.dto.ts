import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsArray,
  ValidateNested,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  INDICATOR_TYPES,
  INDICATOR_CATEGORIES,
  MEASUREMENT_FREQUENCY,
  INDICATOR_STATUS,
} from '../constants/projects.constants';

export class IndicatorValueDto {
  @ApiProperty({ description: 'Indicator value', example: 52 })
  @IsNotEmpty()
  value: any;

  @ApiProperty({ description: 'Date of measurement' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class DisaggregationCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Gender' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Possible values',
    example: ['Male', 'Female', 'Other'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values: string[];
}

export class CreateIndicatorDto {
  @ApiProperty({ description: 'Reference to parent project' })
  @IsNotEmpty({ message: 'Project ID is required' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Reference to objective', required: false })
  @IsOptional()
  @IsString()
  objectiveId?: string;

  @ApiProperty({ description: 'Unique indicator code', example: 'IND-KE-001' })
  @IsNotEmpty({ message: 'Indicator code is required' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Indicator title',
    example: 'Percentage of children demonstrating collaboration skills',
  })
  @IsNotEmpty({ message: 'Indicator title is required' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed indicator description' })
  @IsNotEmpty({ message: 'Indicator description is required' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Indicator type',
    enum: INDICATOR_TYPES,
    example: 'quantitative',
  })
  @IsNotEmpty({ message: 'Indicator type is required' })
  @IsEnum(INDICATOR_TYPES)
  type: string;

  @ApiProperty({
    description: 'Indicator category',
    enum: INDICATOR_CATEGORIES,
    example: 'outcome',
  })
  @IsNotEmpty({ message: 'Indicator category is required' })
  @IsEnum(INDICATOR_CATEGORIES)
  category: string;

  @ApiProperty({ description: 'Unit of measurement', example: 'percentage' })
  @IsNotEmpty({ message: 'Unit is required' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Baseline value', type: IndicatorValueDto })
  @IsNotEmpty({ message: 'Baseline is required' })
  @ValidateNested()
  @Type(() => IndicatorValueDto)
  baseline: IndicatorValueDto;

  @ApiProperty({ description: 'Target value', type: IndicatorValueDto })
  @IsNotEmpty({ message: 'Target is required' })
  @ValidateNested()
  @Type(() => IndicatorValueDto)
  target: IndicatorValueDto;

  @ApiProperty({
    description: 'Data source',
    example: 'Lifeskills Assessment Tool (LAT)',
  })
  @IsNotEmpty({ message: 'Data source is required' })
  @IsString()
  dataSource: string;

  @ApiProperty({
    description: 'Collection method',
    example: 'Direct assessment with children',
  })
  @IsNotEmpty({ message: 'Collection method is required' })
  @IsString()
  collectionMethod: string;

  @ApiProperty({
    description: 'Measurement frequency',
    enum: MEASUREMENT_FREQUENCY,
    example: 'quarterly',
  })
  @IsNotEmpty({ message: 'Frequency is required' })
  @IsEnum(MEASUREMENT_FREQUENCY)
  frequency: string;

  @ApiProperty({ description: 'Responsible person' })
  @IsNotEmpty({ message: 'Responsible person is required' })
  @IsString()
  responsiblePerson: string;

  @ApiProperty({
    description: 'Disaggregation categories',
    type: [DisaggregationCategoryDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisaggregationCategoryDto)
  disaggregation?: DisaggregationCategoryDto[];

  @ApiProperty({
    description: 'Indicator status',
    enum: INDICATOR_STATUS,
    example: 'active',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(INDICATOR_STATUS)
  status?: string;
}

export class UpdateIndicatorDto {
  @ApiProperty({ description: 'Indicator title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Indicator description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Target value',
    type: IndicatorValueDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => IndicatorValueDto)
  target?: IndicatorValueDto;

  @ApiProperty({ description: 'Data source', required: false })
  @IsOptional()
  @IsString()
  dataSource?: string;

  @ApiProperty({ description: 'Collection method', required: false })
  @IsOptional()
  @IsString()
  collectionMethod?: string;

  @ApiProperty({
    description: 'Measurement frequency',
    enum: MEASUREMENT_FREQUENCY,
    required: false,
  })
  @IsOptional()
  @IsEnum(MEASUREMENT_FREQUENCY)
  frequency?: string;

  @ApiProperty({ description: 'Responsible person', required: false })
  @IsOptional()
  @IsString()
  responsiblePerson?: string;

  @ApiProperty({
    description: 'Indicator status',
    enum: INDICATOR_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(INDICATOR_STATUS)
  status?: string;
}

export class AddMeasurementDto {
  @ApiProperty({ description: 'Measured value', example: 61 })
  @IsNotEmpty()
  value: any;

  @ApiProperty({ description: 'Measurement date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Disaggregated data',
    required: false,
    example: { Male: 59, Female: 63 },
  })
  @IsOptional()
  disaggregatedData?: Record<string, any>;

  @ApiProperty({
    description: 'Data quality status',
    enum: ['verified', 'unverified', 'estimated'],
    default: 'unverified',
  })
  @IsOptional()
  @IsEnum(['verified', 'unverified', 'estimated'])
  dataQuality?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Attachment URLs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
