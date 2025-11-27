import { PartialType } from '@nestjs/swagger';
import { CreateLogFrameDto } from './create-logframe.dto';

export class UpdateLogFrameDto extends PartialType(CreateLogFrameDto) {}
