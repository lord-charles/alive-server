import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DataCollectionForm,
  DataCollectionFormDocument,
} from '../schemas/data-collection-form.schema';
import {
  FormResponse,
  FormResponseDocument,
} from '../schemas/form-response.schema';
import {
  CreateFormDto,
  UpdateFormDto,
  SubmitFormResponseDto,
  VerifyResponseDto,
} from '../dto/create-form.dto';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(DataCollectionForm.name)
    private formModel: Model<DataCollectionFormDocument>,
    @InjectModel(FormResponse.name)
    private responseModel: Model<FormResponseDocument>,
  ) {}

  async createForm(
    createFormDto: CreateFormDto,
    userId: string,
  ): Promise<DataCollectionFormDocument> {
    // Generate unique IDs for fields
    const fields = createFormDto.fields.map((field) => ({
      ...field,
      id: new Types.ObjectId().toString(),
    }));

    const form = new this.formModel({
      ...createFormDto,
      fields,
      responsesCount: 0,
      createdBy: userId,
    });

    return form.save();
  }

  async findAll(): Promise<DataCollectionFormDocument[]> {
    return this.formModel
      .find({ deletedAt: null })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllForms(projectId: string): Promise<DataCollectionFormDocument[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    return this.formModel
      .find({ projectId: projectId, deletedAt: null })
      .exec();
  }

  async findOneForm(id: string): Promise<DataCollectionFormDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid form ID');
    }

    const form = await this.formModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async updateForm(
    id: string,
    updateFormDto: UpdateFormDto,
    userId: string,
  ): Promise<DataCollectionFormDocument> {
    const form = await this.findOneForm(id);

    // Generate IDs for new fields
    if (updateFormDto.fields) {
      updateFormDto.fields = updateFormDto.fields.map((field: any) => ({
        ...field,
        id: field.id || new Types.ObjectId().toString(),
      }));
    }

    Object.assign(form, updateFormDto, { updatedBy: userId });
    return form.save();
  }

  async deleteForm(id: string, userId: string): Promise<{ message: string }> {
    const form = await this.findOneForm(id);

    form.deletedAt = new Date();
    form.updatedBy = userId;
    await form.save();

    return { message: 'Form deleted successfully' };
  }

  async submitResponse(
    formId: string,
    responseDto: SubmitFormResponseDto,
    userId: string,
  ): Promise<FormResponseDocument> {
    const form = await this.findOneForm(formId);

    if (form.status !== 'active') {
      throw new BadRequestException('Form is not active');
    }

    const response = new this.responseModel({
      formId: form._id,
      projectId: form.projectId,
      responses: responseDto.responses,
      location: responseDto.location,
      status: responseDto.status || 'submitted',
      submittedBy: new Types.ObjectId(userId),
      submittedAt: new Date(),
    });

    const savedResponse = await response.save();

    // Update form response count and last response date
    form.responsesCount += 1;
    form.lastResponseDate = new Date();
    await form.save();

    return savedResponse;
  }

  async findAllResponses(formId: string): Promise<FormResponseDocument[]> {
    if (!Types.ObjectId.isValid(formId)) {
      throw new BadRequestException('Invalid form ID');
    }

    return this.responseModel
      .find({ formId: new Types.ObjectId(formId), deletedAt: null })
      .populate('submittedBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .exec();
  }

  async verifyResponse(
    responseId: string,
    verifyDto: VerifyResponseDto,
    userId: string,
  ): Promise<FormResponseDocument> {
    if (!Types.ObjectId.isValid(responseId)) {
      throw new BadRequestException('Invalid response ID');
    }

    const response = await this.responseModel
      .findOne({ _id: responseId, deletedAt: null })
      .exec();

    if (!response) {
      throw new NotFoundException(`Response with ID ${responseId} not found`);
    }

    response.status = verifyDto.status;
    response.verifiedBy = new Types.ObjectId(userId);
    response.verifiedAt = new Date();

    return response.save();
  }
}
