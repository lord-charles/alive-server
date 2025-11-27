import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type IndicatorDocument = Indicator & Document;

// Embedded schemas
@Schema({ _id: false })
export class IndicatorValue {
  @ApiProperty({ description: 'Indicator value', example: 52 })
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any; // Can be number or string

  @ApiProperty({ description: 'Date of measurement' })
  @Prop({ required: true })
  date: Date;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Prop()
  note?: string;
}

@Schema({ _id: false })
export class DisaggregationCategory {
  @ApiProperty({ description: 'Category name', example: 'Gender' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Possible values',
    example: ['Male', 'Female', 'Other'],
  })
  @Prop({ type: [String], required: true })
  values: string[];
}

@Schema({ _id: false })
export class IndicatorMeasurement {
  @ApiProperty({ description: 'Unique measurement ID' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({ description: 'Measured value', example: 61 })
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any; // Can be number or string

  @ApiProperty({ description: 'Measurement date' })
  @Prop({ required: true })
  date: Date;

  @ApiProperty({ description: 'Disaggregated data', required: false })
  @Prop({ type: Map, of: MongooseSchema.Types.Mixed })
  disaggregatedData?: Map<string, any>;

  @ApiProperty({
    description: 'Data quality status',
    enum: ['verified', 'unverified', 'estimated'],
    example: 'verified',
  })
  @Prop({
    required: true,
    enum: ['verified', 'unverified', 'estimated'],
    default: 'unverified',
  })
  dataQuality: string;

  @ApiProperty({ description: 'Person who collected the data' })
  @Prop({ required: true })
  collectedBy: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Prop()
  notes?: string;

  @ApiProperty({
    description: 'Attachment URLs',
    type: [String],
    required: false,
  })
  @Prop({ type: [String] })
  attachments?: string[];
}

// Main Indicator schema
@Schema({ timestamps: true })
export class Indicator {
  @ApiProperty({ description: 'Reference to parent project' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @ApiProperty({ description: 'Reference to objective', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Objective' })
  objectiveId?: Types.ObjectId;

  @ApiProperty({ description: 'Unique indicator code', example: 'IND-KE-001' })
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @ApiProperty({
    description: 'Indicator title',
    example: 'Percentage of children demonstrating collaboration skills',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Detailed indicator description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'Indicator type',
    enum: ['quantitative', 'qualitative'],
    example: 'quantitative',
  })
  @Prop({
    required: true,
    enum: ['quantitative', 'qualitative'],
  })
  type: string;

  @ApiProperty({
    description: 'Indicator category',
    enum: ['input', 'output', 'outcome', 'impact'],
    example: 'outcome',
  })
  @Prop({
    required: true,
    enum: ['input', 'output', 'outcome', 'impact'],
    index: true,
  })
  category: string;

  @ApiProperty({ description: 'Unit of measurement', example: 'percentage' })
  @Prop({ required: true })
  unit: string;

  @ApiProperty({ description: 'Baseline value', type: IndicatorValue })
  @Prop({ type: IndicatorValue, required: true })
  baseline: IndicatorValue;

  @ApiProperty({ description: 'Target value', type: IndicatorValue })
  @Prop({ type: IndicatorValue, required: true })
  target: IndicatorValue;

  @ApiProperty({
    description: 'Data source',
    example: 'Lifeskills Assessment Tool (LAT)',
  })
  @Prop({ required: true })
  dataSource: string;

  @ApiProperty({
    description: 'Collection method',
    example: 'Direct assessment with children',
  })
  @Prop({ required: true })
  collectionMethod: string;

  @ApiProperty({
    description: 'Measurement frequency',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'one-time'],
    example: 'quarterly',
  })
  @Prop({
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'one-time'],
  })
  frequency: string;

  @ApiProperty({ description: 'Responsible person' })
  @Prop({ required: true })
  responsiblePerson: string;

  @ApiProperty({
    description: 'Disaggregation categories',
    type: [DisaggregationCategory],
  })
  @Prop({ type: [DisaggregationCategory], default: [] })
  disaggregation: DisaggregationCategory[];

  @ApiProperty({
    description: 'Measurement history',
    type: [IndicatorMeasurement],
  })
  @Prop({ type: [IndicatorMeasurement], default: [] })
  measurements: IndicatorMeasurement[];

  @ApiProperty({
    description: 'Indicator status',
    enum: ['active', 'inactive', 'archived'],
    example: 'active',
  })
  @Prop({
    required: true,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true,
  })
  status: string;

  @ApiProperty({ description: 'User who created the indicator' })
  @Prop({ required: true })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated the indicator',
    required: false,
  })
  @Prop()
  updatedBy?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Prop()
  deletedAt?: Date;
}

export const IndicatorSchema = SchemaFactory.createForClass(Indicator);

// Add indexes
IndicatorSchema.index({ projectId: 1, category: 1 });
IndicatorSchema.index({ objectiveId: 1 });
IndicatorSchema.index({ deletedAt: 1 });
