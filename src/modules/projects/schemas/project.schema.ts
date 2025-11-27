import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProjectDocument = Project & Document;

// Embedded schemas
@Schema({ _id: false })
export class ProjectLocation {
  @ApiProperty({ description: 'Country name', example: 'Kenya' })
  @Prop({ required: true })
  country: string;

  @ApiProperty({
    description: 'Region or state',
    example: 'Central Region',
    required: false,
  })
  @Prop()
  region?: string;

  @ApiProperty({
    description: 'District or county',
    example: 'Nairobi County',
    required: false,
  })
  @Prop()
  district?: string;

  @ApiProperty({ description: 'Geographic coordinates', required: false })
  @Prop({
    type: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    required: false,
  })
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

@Schema({ _id: false })
export class FundingSource {
  @ApiProperty({ description: 'Unique identifier for funding source' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({
    description: 'Name of funding source',
    example: 'USAID Grant',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Funding amount', example: 250000 })
  @Prop({ required: true, min: 0 })
  amount: number;

  @ApiProperty({
    description: 'Type of funding',
    enum: ['grant', 'loan', 'donation', 'government', 'other'],
    example: 'grant',
  })
  @Prop({
    required: true,
    enum: ['grant', 'loan', 'donation', 'government', 'other'],
  })
  type: string;
}

@Schema({ _id: false })
export class ProjectBudget {
  @ApiProperty({ description: 'Total budget amount', example: 500000 })
  @Prop({ required: true, min: 0 })
  total: number;

  @ApiProperty({ description: 'Amount spent', example: 125000 })
  @Prop({ required: true, min: 0, default: 0 })
  spent: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @Prop({ required: true, default: 'USD' })
  currency: string;

  @ApiProperty({
    description: 'List of funding sources',
    type: [FundingSource],
  })
  @Prop({ type: [FundingSource], default: [] })
  fundingSources: FundingSource[];
}

@Schema({ _id: false })
export class Stakeholder {
  @ApiProperty({ description: 'Unique identifier for stakeholder' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({
    description: 'Stakeholder name',
    example: 'Ministry of Education',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Role in project',
    example: 'Government Partner',
  })
  @Prop({ required: true })
  role: string;

  @ApiProperty({ description: 'Organization name', required: false })
  @Prop()
  organization?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @Prop()
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @Prop()
  phone?: string;

  @ApiProperty({
    description: 'Type of stakeholder',
    enum: ['beneficiary', 'partner', 'donor', 'implementer', 'government'],
    example: 'government',
  })
  @Prop({
    required: true,
    enum: ['beneficiary', 'partner', 'donor', 'implementer', 'government'],
  })
  type: string;
}

// Main Project schema
@Schema({ timestamps: true })
export class Project {
  @ApiProperty({
    description: 'Project title',
    example: 'ALiVE Kenya - Lifeskills Assessment Program',
  })
  @Prop({ required: true, index: true })
  title: string;

  @ApiProperty({ description: 'Detailed project description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'Project sector', example: 'Education' })
  @Prop({ required: true, index: true })
  sector: string;

  @ApiProperty({ description: 'Project location', type: ProjectLocation })
  @Prop({ type: ProjectLocation, required: true })
  location: ProjectLocation;

  @ApiProperty({ description: 'Project start date' })
  @Prop({ required: true, index: true })
  startDate: Date;

  @ApiProperty({ description: 'Project end date' })
  @Prop({ required: true, index: true })
  endDate: Date;

  @ApiProperty({
    description: 'Project status',
    enum: ['planning', 'active', 'completed', 'on-hold', 'cancelled'],
    example: 'active',
  })
  @Prop({
    required: true,
    enum: ['planning', 'active', 'completed', 'on-hold', 'cancelled'],
    default: 'planning',
    index: true,
  })
  status: string;

  @ApiProperty({
    description: 'Project priority',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'high',
  })
  @Prop({
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  })
  priority: string;

  @ApiProperty({ description: 'Project budget', type: ProjectBudget })
  @Prop({ type: ProjectBudget, required: true })
  budget: ProjectBudget;

  @ApiProperty({ description: 'Project stakeholders', type: [Stakeholder] })
  @Prop({ type: [Stakeholder], default: [] })
  stakeholders: Stakeholder[];

  @ApiProperty({
    description: 'Project tags for categorization',
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({ description: 'User who created the project' })
  @Prop({ required: true })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated the project',
    required: false,
  })
  @Prop()
  updatedBy?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Prop()
  deletedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Add indexes
ProjectSchema.index({ title: 'text', description: 'text' });
ProjectSchema.index({ 'location.country': 1 });
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ deletedAt: 1 });
