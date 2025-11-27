import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { SystemLogsModule } from '../system-logs/system-logs.module';

// Schemas
import { Project, ProjectSchema } from './schemas/project.schema';
import { Objective, ObjectiveSchema } from './schemas/objective.schema';
import { Indicator, IndicatorSchema } from './schemas/indicator.schema';
import { Activity, ActivitySchema } from './schemas/activity.schema';
import { LogFrame, LogFrameSchema } from './schemas/logframe.schema';
import {
  DataCollectionForm,
  DataCollectionFormSchema,
} from './schemas/data-collection-form.schema';
import {
  FormResponse,
  FormResponseSchema,
} from './schemas/form-response.schema';
import {
  ProjectActivity,
  ProjectActivitySchema,
} from './schemas/project-activity.schema';

// Services
import { ProjectsService } from './services/projects.service';
import { IndicatorsService } from './services/indicators.service';
import { FormsService } from './services/forms.service';
import { ObjectivesService } from './services/objectives.service';
import { ActivitiesService } from './services/activities.service';
import { LogFrameService } from './services/logframe.service';

// Controllers
import { ProjectsController } from './controllers/projects.controller';
import { IndicatorsController } from './controllers/indicators.controller';
import { FormsController } from './controllers/forms.controller';
import { ObjectivesController } from './controllers/objectives.controller';
import { ActivitiesController } from './controllers/activities.controller';
import { LogFrameController } from './controllers/logframe.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Objective.name, schema: ObjectiveSchema },
      { name: Indicator.name, schema: IndicatorSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: LogFrame.name, schema: LogFrameSchema },
      { name: DataCollectionForm.name, schema: DataCollectionFormSchema },
      { name: FormResponse.name, schema: FormResponseSchema },
      { name: ProjectActivity.name, schema: ProjectActivitySchema },
    ]),
    AuthModule,
    SystemLogsModule,
  ],
  controllers: [
    ProjectsController,
    IndicatorsController,
    FormsController,
    ObjectivesController,
    ActivitiesController,
    LogFrameController,
  ],
  providers: [
    ProjectsService,
    IndicatorsService,
    FormsService,
    ObjectivesService,
    ActivitiesService,
    LogFrameService,
  ],
  exports: [
    ProjectsService,
    IndicatorsService,
    FormsService,
    ObjectivesService,
    ActivitiesService,
    LogFrameService,
  ],
})
export class ProjectsModule {}
