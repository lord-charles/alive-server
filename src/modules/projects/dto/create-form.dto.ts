import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FORM_TYPES,
  FIELD_TYPES,
  FORM_STATUS,
  RESPONSE_STATUS,
} from '../constants/projects.constants';

export class FieldValidationDto {
  @ApiProperty({ description: 'Minimum value', required: false })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiProperty({ description: 'Maximum value', required: false })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiProperty({ description: 'Validation pattern (regex)', required: false })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({ description: 'Custom validation message', required: false })
  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class FormFieldDto {
  @ApiProperty({ description: 'Field label', example: 'Child ID' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Field type',
    enum: FIELD_TYPES,
    example: 'text',
  })
  @IsNotEmpty()
  @IsEnum(FIELD_TYPES)
  fieldType: string;

  @ApiProperty({
    description: 'Is field required',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({
    description: 'Options for select/multiselect/radio fields',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({ description: 'Placeholder text', required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({ description: 'Field description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Validation rules',
    type: FieldValidationDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FieldValidationDto)
  validation?: FieldValidationDto;

  @ApiProperty({ description: 'Display order', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  order: number;
}

export class CreateFormDto {
  @ApiProperty({ description: 'Reference to parent project' })
  @IsNotEmpty({ message: 'Project ID is required' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Reference to activity', required: false })
  @IsOptional()
  @IsString()
  activityId?: string;

  @ApiProperty({ description: 'Reference to indicator', required: false })
  @IsOptional()
  @IsString()
  indicatorId?: string;

  @ApiProperty({
    description: 'Form title',
    example: 'Lifeskills Assessment Tool (LAT) - Collaboration Module',
  })
  @IsNotEmpty({ message: 'Form title is required' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Form description' })
  @IsNotEmpty({ message: 'Form description is required' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Form type',
    enum: FORM_TYPES,
    example: 'assessment',
  })
  @IsNotEmpty({ message: 'Form type is required' })
  @IsEnum(FORM_TYPES)
  formType: string;

  @ApiProperty({ description: 'Form fields', type: [FormFieldDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one field is required' })
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];

  @ApiProperty({
    description: 'Form status',
    enum: FORM_STATUS,
    example: 'draft',
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(FORM_STATUS)
  status?: string;

  @ApiProperty({ description: 'Target number of responses', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  targetResponses?: number;
}

export class UpdateFormDto {
  @ApiProperty({ description: 'Form title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Form description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Form fields',
    type: [FormFieldDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields?: FormFieldDto[];

  @ApiProperty({
    description: 'Form status',
    enum: FORM_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(FORM_STATUS)
  status?: string;

  @ApiProperty({ description: 'Target number of responses', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  targetResponses?: number;
}

export class SubmitFormResponseDto {
  @ApiProperty({
    description: 'Form responses as key-value pairs',
    example: { childId: 'CH-001', age: 12 },
  })
  @IsNotEmpty({ message: 'Responses are required' })
  responses: Record<string, any>;

  @ApiProperty({
    description: 'Location where response was submitted',
    required: false,
    example: { latitude: -1.286389, longitude: 36.817223 },
  })
  @IsOptional()
  location?: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty({
    description: 'Response status',
    enum: RESPONSE_STATUS,
    example: 'submitted',
    default: 'submitted',
  })
  @IsOptional()
  @IsEnum(RESPONSE_STATUS)
  status?: string;
}

export class VerifyResponseDto {
  @ApiProperty({
    description: 'Verification status',
    enum: ['verified', 'rejected'],
    example: 'verified',
  })
  @IsNotEmpty()
  @IsEnum(['verified', 'rejected'])
  status: string;
}
