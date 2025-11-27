import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ObjectiveDocument = Objective & Document;

@Schema({ timestamps: true })
export class Objective {
  @ApiProperty({ description: 'Reference to parent project' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @ApiProperty({
    description: 'Objective title',
    example: 'Improve Collaboration Skills Among Primary School Children',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Detailed objective description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'Objective type in results framework',
    enum: ['impact', 'outcome', 'output'],
    example: 'outcome',
  })
  @Prop({
    required: true,
    enum: ['impact', 'outcome', 'output'],
    index: true,
  })
  type: string;

  @ApiProperty({
    description: 'Parent objective ID for hierarchical structure',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'Objective' })
  parentObjectiveId?: Types.ObjectId;

  @ApiProperty({ description: 'Related indicator IDs', type: [String] })
  @Prop({ type: [String], default: [] })
  indicators: string[];

  @ApiProperty({ description: 'Related activity IDs', type: [String] })
  @Prop({ type: [String], default: [] })
  activities: string[];

  @ApiProperty({ description: 'Objective start date' })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({ description: 'Objective end date' })
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty({
    description: 'Objective status',
    enum: ['not-started', 'in-progress', 'completed', 'delayed'],
    example: 'in-progress',
  })
  @Prop({
    required: true,
    enum: ['not-started', 'in-progress', 'completed', 'delayed'],
    default: 'not-started',
    index: true,
  })
  status: string;

  @ApiProperty({ description: 'Progress percentage (0-100)', example: 65 })
  @Prop({ required: true, min: 0, max: 100, default: 0 })
  progress: number;

  @ApiProperty({ description: 'Display order', example: 1 })
  @Prop({ required: true, default: 1 })
  order: number;

  @ApiProperty({ description: 'User who created the objective' })
  @Prop({ required: true })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated the objective',
    required: false,
  })
  @Prop()
  updatedBy?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Prop()
  deletedAt?: Date;
}

export const ObjectiveSchema = SchemaFactory.createForClass(Objective);

// Add indexes
ObjectiveSchema.index({ projectId: 1, order: 1 });
ObjectiveSchema.index({ parentObjectiveId: 1 });
ObjectiveSchema.index({ deletedAt: 1 });
