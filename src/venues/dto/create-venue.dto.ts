import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({
    description: 'Name of public place',
    example: 'Movistar Arena',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Signs of sites',
    example: 'Av NQS calle 64',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    description: 'UUID of the municipality where the venue is located',
    example: '6d731bf2-5807-4d69-be3a-06c7353f78bc',
  })
  @IsUUID('4')
  @IsNotEmpty()
  municipalityId!: string;

  @ApiProperty({
    description: 'Number of people that the venue can hold',
    example: '500',
  })
  @IsInt()
  @IsNotEmpty()
  capacity!: number;

  @ApiProperty({
    description: 'Url with picture of bulding',
    example: 'http://img.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imgUrl?: string | null;

  @ApiProperty({
    description: 'latitude of the place ',
    example: '48.8584',
  })
  @IsLatitude()
  @IsNotEmpty()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude of the place',
    example: '2.2945',
  })
  @IsLongitude()
  @IsNotEmpty()
  longitude!: number;
}
