import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LogFrameDocument = LogFrame & Document;

// Embedded schemas
@Schema({ _id: false })
export class LogFrameOutput {
  @ApiProperty({ description: 'Unique output ID' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({
    description: 'Output description',
    example:
      'Comprehensive lifeskills assessments conducted across 47 counties',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'Related indicator IDs', type: [String] })
  @Prop({ type: [String], default: [] })
  indicators: string[];

  @ApiProperty({ description: 'Related activity IDs', type: [String] })
  @Prop({ type: [String], default: [] })
  activities: string[];

  @ApiProperty({ description: 'Display order', example: 1 })
  @Prop({ required: true })
  order: number;
}

@Schema({ _id: false })
export class Risk {
  @ApiProperty({ description: 'Unique risk ID' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({
    description: 'Risk description',
    example: 'Political instability affecting project implementation',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'Risk level',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'medium',
  })
  @Prop({
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
  })
  level: string;

  @ApiProperty({ description: 'Mitigation strategy' })
  @Prop({ required: true })
  mitigation: string;

  @ApiProperty({
    description: 'Risk status',
    enum: ['identified', 'mitigated', 'occurred', 'closed'],
    example: 'mitigated',
  })
  @Prop({
    required: true,
    enum: ['identified', 'mitigated', 'occurred', 'closed'],
    default: 'identified',
  })
  status: string;
}

// Main LogFrame schema
@Schema({ timestamps: true })
export class LogFrame {
  @ApiProperty({ description: 'Reference to parent project' })
  @Prop({
    type: Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true,
    index: true,
  })
  projectId: Types.ObjectId;

  @ApiProperty({ description: 'Overall goal (impact level)' })
  @Prop({ required: true })
  goal: string;

  @ApiProperty({ description: 'Project purpose (outcome level)' })
  @Prop({ required: true })
  purpose: string;

  @ApiProperty({ description: 'Project outputs', type: [LogFrameOutput] })
  @Prop({ type: [LogFrameOutput], default: [] })
  outputs: LogFrameOutput[];

  @ApiProperty({ description: 'Key assumptions', type: [String] })
  @Prop({ type: [String], default: [] })
  assumptions: string[];

  @ApiProperty({ description: 'Risk register', type: [Risk] })
  @Prop({ type: [Risk], default: [] })
  risks: Risk[];

  @ApiProperty({ description: 'User who created the log frame' })
  @Prop({ required: true })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated the log frame',
    required: false,
  })
  @Prop()
  updatedBy?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Prop()
  deletedAt?: Date;
}

export const LogFrameSchema = SchemaFactory.createForClass(LogFrame);

// Add indexes
LogFrameSchema.index({ deletedAt: 1 });
