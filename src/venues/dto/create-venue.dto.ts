import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
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
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    description: 'May be a town',
    example: 'Bogotá',
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

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
  })
  @IsString()
  imgUrl!: string | null;

  @ApiProperty({
    description: 'coordinates: latitude of the place ',
    example: '48.8584',
  })
  @IsLatitude()
  @IsNotEmpty()
  latitude!: number;

  @ApiProperty({
    description: 'coordinates: Longitude of the place',
    example: '2.2945',
  })
  @IsLongitude()
  @IsNotEmpty()
  longitude!: number;
}
