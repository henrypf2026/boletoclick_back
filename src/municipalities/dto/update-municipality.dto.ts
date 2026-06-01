import { PartialType } from '@nestjs/swagger';
import { CreateMunicipalityDto } from './create-municipality.dto';

export class UpdateMunicipalityDto extends PartialType(CreateMunicipalityDto) {}
