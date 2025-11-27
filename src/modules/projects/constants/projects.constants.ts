// Project-related constants

export const SECTORS = [
  'Education',
  'Health',
  'Agriculture',
  'Water & Sanitation',
  'Governance',
  'Economic Development',
  'Environment',
  'Social Protection',
  'Infrastructure',
  'Other',
] as const;

export const COUNTRIES = [
  'Kenya',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Burundi',
  'South Sudan',
  'Ethiopia',
  'Somalia',
  'Democratic Republic of Congo',
] as const;

export const PROJECT_STATUS = [
  'planning',
  'active',
  'completed',
  'on-hold',
  'cancelled',
] as const;

export const PROJECT_PRIORITY = ['low', 'medium', 'high', 'critical'] as const;

export const FUNDING_TYPES = [
  'grant',
  'loan',
  'donation',
  'government',
  'other',
] as const;

export const STAKEHOLDER_TYPES = [
  'beneficiary',
  'partner',
  'donor',
  'implementer',
  'government',
] as const;

// Objective-related constants

export const OBJECTIVE_TYPES = ['impact', 'outcome', 'output'] as const;

export const OBJECTIVE_STATUS = [
  'not-started',
  'in-progress',
  'completed',
  'delayed',
] as const;

// Indicator-related constants

export const INDICATOR_TYPES = ['quantitative', 'qualitative'] as const;

export const INDICATOR_CATEGORIES = [
  'input',
  'output',
  'outcome',
  'impact',
] as const;

export const MEASUREMENT_FREQUENCY = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annually',
  'one-time',
] as const;

export const DATA_QUALITY = ['verified', 'unverified', 'estimated'] as const;

export const INDICATOR_STATUS = ['active', 'inactive', 'archived'] as const;

// Activity-related constants

export const ACTIVITY_TYPES = [
  'training',
  'assessment',
  'distribution',
  'construction',
  'meeting',
  'research',
  'other',
] as const;

export const ACTIVITY_STATUS = [
  'planned',
  'in-progress',
  'completed',
  'cancelled',
  'delayed',
] as const;

export const MILESTONE_STATUS = ['pending', 'completed', 'overdue'] as const;

// Form-related constants

export const FORM_TYPES = [
  'assessment',
  'survey',
  'monitoring',
  'evaluation',
  'feedback',
  'registration',
] as const;

export const FIELD_TYPES = [
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
] as const;

export const FORM_STATUS = ['draft', 'active', 'archived'] as const;

export const RESPONSE_STATUS = [
  'draft',
  'submitted',
  'verified',
  'rejected',
] as const;

// LogFrame-related constants

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export const RISK_STATUS = [
  'identified',
  'mitigated',
  'occurred',
  'closed',
] as const;

// Project Activity (Audit Trail) constants

export const PROJECT_ACTIVITY_TYPES = [
  'created',
  'updated',
  'status_change',
  'milestone_completed',
  'indicator_updated',
  'activity_completed',
  'report_published',
  'comment',
] as const;

// Type exports for TypeScript
export type Sector = (typeof SECTORS)[number];
export type Country = (typeof COUNTRIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUS)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITY)[number];
export type FundingType = (typeof FUNDING_TYPES)[number];
export type StakeholderType = (typeof STAKEHOLDER_TYPES)[number];
export type ObjectiveType = (typeof OBJECTIVE_TYPES)[number];
export type ObjectiveStatus = (typeof OBJECTIVE_STATUS)[number];
export type IndicatorType = (typeof INDICATOR_TYPES)[number];
export type IndicatorCategory = (typeof INDICATOR_CATEGORIES)[number];
export type MeasurementFrequency = (typeof MEASUREMENT_FREQUENCY)[number];
export type DataQuality = (typeof DATA_QUALITY)[number];
export type IndicatorStatus = (typeof INDICATOR_STATUS)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type ActivityStatus = (typeof ACTIVITY_STATUS)[number];
export type MilestoneStatus = (typeof MILESTONE_STATUS)[number];
export type FormType = (typeof FORM_TYPES)[number];
export type FieldType = (typeof FIELD_TYPES)[number];
export type FormStatus = (typeof FORM_STATUS)[number];
export type ResponseStatus = (typeof RESPONSE_STATUS)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type RiskStatus = (typeof RISK_STATUS)[number];
export type ProjectActivityType = (typeof PROJECT_ACTIVITY_TYPES)[number];
