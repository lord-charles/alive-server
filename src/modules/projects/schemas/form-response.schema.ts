import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FormResponseDocument = FormResponse & Document;

@Schema({ _id: false })
export class ResponseLocation {
  @ApiProperty({ description: 'Latitude' })
  @Prop({ required: true })
  latitude: number;

  @ApiProperty({ description: 'Longitude' })
  @Prop({ required: true })
  longitude: number;
}

@Schema({ timestamps: true })
export class FormResponse {
  @ApiProperty({ description: 'Reference to form' })
  @Prop({
    type: Types.ObjectId,
    ref: 'DataCollectionForm',
    required: true,
    index: true,
  })
  formId: Types.ObjectId;

  @ApiProperty({ description: 'Reference to project' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @ApiProperty({ description: 'Form responses as key-value pairs' })
  @Prop({ type: Map, of: MongooseSchema.Types.Mixed, required: true })
  responses: Map<string, any>;

  @ApiProperty({ description: 'User who submitted the response' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  submittedBy: Types.ObjectId;

  @ApiProperty({ description: 'Submission timestamp' })
  @Prop({ required: true, default: Date.now })
  submittedAt: Date;

  @ApiProperty({
    description: 'Location where response was submitted',
    type: ResponseLocation,
    required: false,
  })
  @Prop({ type: ResponseLocation })
  location?: ResponseLocation;

  @ApiProperty({
    description: 'Response status',
    enum: ['draft', 'submitted', 'verified', 'rejected'],
    example: 'submitted',
  })
  @Prop({
    required: true,
    enum: ['draft', 'submitted', 'verified', 'rejected'],
    default: 'draft',
    index: true,
  })
  status: string;

  @ApiProperty({
    description: 'User who verified the response',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @ApiProperty({ description: 'Verification timestamp', required: false })
  @Prop()
  verifiedAt?: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Prop()
  deletedAt?: Date;
}

export const FormResponseSchema = SchemaFactory.createForClass(FormResponse);

// Add indexes
FormResponseSchema.index({ formId: 1, status: 1 });
FormResponseSchema.index({ projectId: 1 });
FormResponseSchema.index({ submittedBy: 1 });
FormResponseSchema.index({ submittedAt: -1 });
FormResponseSchema.index({ deletedAt: 1 });
