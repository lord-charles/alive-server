import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DataCollectionFormDocument = DataCollectionForm & Document;

// Embedded schemas
@Schema({ _id: false })
export class FieldValidation {
  @ApiProperty({ description: 'Minimum value', required: false })
  @Prop()
  min?: number;

  @ApiProperty({ description: 'Maximum value', required: false })
  @Prop()
  max?: number;

  @ApiProperty({ description: 'Validation pattern (regex)', required: false })
  @Prop()
  pattern?: string;

  @ApiProperty({ description: 'Custom validation message', required: false })
  @Prop()
  customMessage?: string;
}

@Schema({ _id: false })
export class FormField {
  @ApiProperty({ description: 'Unique field ID' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({ description: 'Field label', example: 'Child ID' })
  @Prop({ required: true })
  label: string;

  @ApiProperty({
    description: 'Field type',
    enum: [
      'text',
      'number',
      'email',
      'date',
      'textarea',
      'select',
      'multiselect',
      'checkbox',
      'radio',
      'file',
      'location',
    ],
    example: 'text',
  })
  @Prop({
    required: true,
    enum: [
      'text',
      'number',
      'email',
      'date',
      'textarea',
      'select',
      'multiselect',
      'checkbox',
      'radio',
      'file',
      'location',
    ],
  })
  fieldType: string;

  @ApiProperty({ description: 'Is field required', example: true })
  @Prop({ required: true, default: false })
  required: boolean;

  @ApiProperty({
    description: 'Options for select/multiselect/radio fields',
    type: [String],
    required: false,
  })
  @Prop({ type: [String] })
  options?: string[];

  @ApiProperty({ description: 'Placeholder text', required: false })
  @Prop()
  placeholder?: string;

  @ApiProperty({ description: 'Field description', required: false })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'Validation rules',
    type: FieldValidation,
    required: false,
  })
  @Prop({ type: FieldValidation })
  validation?: FieldValidation;

  @ApiProperty({ description: 'Display order', example: 1 })
  @Prop({ required: true })
  order: number;
}

// Main DataCollectionForm schema
@Schema({ timestamps: true })
export class DataCollectionForm {
  @ApiProperty({ description: 'Reference to parent project' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @ApiProperty({ description: 'Reference to activity', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Activity' })
  activityId?: Types.ObjectId;

  @ApiProperty({ description: 'Reference to indicator', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Indicator' })
  indicatorId?: Types.ObjectId;

  @ApiProperty({
    description: 'Form title',
    example: 'Lifeskills Assessment Tool (LAT) - Collaboration Module',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Form description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'Form type',
    enum: [
      'assessment',
      'survey',
      'monitoring',
      'evaluation',
      'feedback',
      'registration',
    ],
    example: 'assessment',
  })
  @Prop({
    required: true,
    enum: [
      'assessment',
      'survey',
      'monitoring',
      'evaluation',
      'feedback',
      'registration',
    ],
    index: true,
  })
  formType: string;

  @ApiProperty({ description: 'Form fields', type: [FormField] })
  @Prop({ type: [FormField], required: true })
  fields: FormField[];

  @ApiProperty({
    description: 'Form status',
    enum: ['draft', 'active', 'archived'],
    example: 'active',
  })
  @Prop({
    required: true,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
    index: true,
  })
  status: string;

  @ApiProperty({ description: 'Number of responses received', example: 850 })
  @Prop({ required: true, min: 0, default: 0 })
  responsesCount: number;

  @ApiProperty({ description: 'Target number of responses', required: false })
  @Prop({ min: 0 })
  targetResponses?: number;

  @ApiProperty({ description: 'Date of last response', required: false })
  @Prop()
  lastResponseDate?: Date;

  @ApiProperty({ description: 'User who created the form' })
  @Prop({ required: true })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated the form',
    required: false,
  })
  @Prop()
  updatedBy?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Prop()
  deletedAt?: Date;
}

export const DataCollectionFormSchema =
  SchemaFactory.createForClass(DataCollectionForm);

// Add indexes
DataCollectionFormSchema.index({ projectId: 1, status: 1 });
DataCollectionFormSchema.index({ activityId: 1 });
DataCollectionFormSchema.index({ indicatorId: 1 });
DataCollectionFormSchema.index({ deletedAt: 1 });
