import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProjectActivityDocument = ProjectActivity & Document;

@Schema({ timestamps: true })
export class ProjectActivity {
  @ApiProperty({ description: 'Reference to project' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @ApiProperty({
    description: 'Activity type',
    enum: [
      'created',
      'updated',
      'status_change',
      'milestone_completed',
      'indicator_updated',
      'activity_completed',
      'report_published',
      'comment',
    ],
    example: 'created',
  })
  @Prop({
    required: true,
    enum: [
      'created',
      'updated',
      'status_change',
      'milestone_completed',
      'indicator_updated',
      'activity_completed',
      'report_published',
      'comment',
    ],
    index: true,
  })
  type: string;

  @ApiProperty({
    description: 'Activity description',
    example: 'Project created and initialized',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'User who performed the activity' })
  @Prop({ required: true })
  performedBy: string;

  @ApiProperty({ description: 'Activity timestamp' })
  @Prop({ required: true, default: Date.now, index: true })
  timestamp: Date;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Prop({ type: Map, of: MongooseSchema.Types.Mixed })
  metadata?: Map<string, any>;
}

export const ProjectActivitySchema =
  SchemaFactory.createForClass(ProjectActivity);

// Add indexes
ProjectActivitySchema.index({ projectId: 1, timestamp: -1 });
ProjectActivitySchema.index({ performedBy: 1 });
