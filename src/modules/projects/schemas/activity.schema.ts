import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ActivityDocument = Activity & Document;

// Embedded schemas
@Schema({ _id: false })
export class ActivityParticipant {
  @ApiProperty({
    description: 'Participant name',
    example: 'Assessment Team A',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Role in activity', example: 'Data Collectors' })
  @Prop({ required: true })
  role: string;

  @ApiProperty({ description: 'Organization', required: false })
  @Prop()
  organization?: string;

  @ApiProperty({ description: 'Attendance status', required: false })
  @Prop({ default: false })
  attended?: boolean;
}

@Schema({ _id: false })
export class Milestone {
  @ApiProperty({ description: 'Unique milestone ID' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({
    description: 'Milestone title',
    example: 'Training of assessors completed',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Due date' })
  @Prop({ required: true })
  dueDate: Date;

  @ApiProperty({
    description: 'Milestone status',
    enum: ['pending', 'completed', 'overdue'],
    example: 'completed',
  })
  @Prop({
    required: true,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending',
  })
  status: string;

  @ApiProperty({ description: 'Completion date', required: false })
  @Prop()
  completedDate?: Date;
}

@Schema({ _id: false })
export class ActivityBudget {
  @ApiProperty({ description: 'Allocated budget', example: 15000 })
  @Prop({ required: true, min: 0 })
  allocated: number;

  @ApiProperty({ description: 'Amount spent', example: 14800 })
  @Prop({ required: true, min: 0, default: 0 })
  spent: number;
}

// Main Activity schema
@Schema({ timestamps: true })
export class Activity {
  @ApiProperty({ description: 'Reference to parent project' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @ApiProperty({ description: 'Reference to objective', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Objective' })
  objectiveId?: Types.ObjectId;

  @ApiProperty({
    description: 'Activity title',
    example: 'Baseline Lifeskills Assessment - Nairobi County',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Detailed activity description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'Activity type',
    enum: [
      'training',
      'assessment',
      'distribution',
      'construction',
      'meeting',
      'research',
      'other',
    ],
    example: 'assessment',
  })
  @Prop({
    required: true,
    enum: [
      'training',
      'assessment',
      'distribution',
      'construction',
      'meeting',
      'research',
      'other',
    ],
    index: true,
  })
  type: string;

  @ApiProperty({ description: 'Activity start date' })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({ description: 'Activity end date' })
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty({
    description: 'Activity status',
    enum: ['planned', 'in-progress', 'completed', 'cancelled', 'delayed'],
    example: 'completed',
  })
  @Prop({
    required: true,
    enum: ['planned', 'in-progress', 'completed', 'cancelled', 'delayed'],
    default: 'planned',
    index: true,
  })
  status: string;

  @ApiProperty({ description: 'Progress percentage (0-100)', example: 100 })
  @Prop({ required: true, min: 0, max: 100, default: 0 })
  progress: number;

  @ApiProperty({
    description: 'Activity location',
    example: 'Nairobi County, Kenya',
  })
  @Prop({ required: true })
  location: string;

  @ApiProperty({ description: 'Responsible person' })
  @Prop({ required: true })
  responsiblePerson: string;

  @ApiProperty({
    description: 'Activity participants',
    type: [ActivityParticipant],
  })
  @Prop({ type: [ActivityParticipant], default: [] })
  participants: ActivityParticipant[];

  @ApiProperty({ description: 'Activity budget', type: ActivityBudget })
  @Prop({ type: ActivityBudget, required: true })
  budget: ActivityBudget;

  @ApiProperty({ description: 'Expected outputs', type: [String] })
  @Prop({ type: [String], default: [] })
  outputs: string[];

  @ApiProperty({ description: 'Related indicator IDs', type: [String] })
  @Prop({ type: [String], default: [] })
  indicators: string[];

  @ApiProperty({ description: 'Related form IDs', type: [String] })
  @Prop({ type: [String], default: [] })
  forms: string[];

  @ApiProperty({ description: 'Activity milestones', type: [Milestone] })
  @Prop({ type: [Milestone], default: [] })
  milestones: Milestone[];

  @ApiProperty({ description: 'Dependent activity IDs', type: [String] })
  @Prop({ type: [String], default: [] })
  dependencies: string[];

  @ApiProperty({ description: 'User who created the activity' })
  @Prop({ required: true })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated the activity',
    required: false,
  })
  @Prop()
  updatedBy?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Prop()
  deletedAt?: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Add indexes
ActivitySchema.index({ projectId: 1, status: 1 });
ActivitySchema.index({ objectiveId: 1 });
ActivitySchema.index({ responsiblePerson: 1 });
ActivitySchema.index({ deletedAt: 1 });
