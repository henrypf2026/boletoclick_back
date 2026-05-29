import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
    description: 'Number of people that can be',
    example: '500',
  })
  @IsString()
  @IsNotEmpty()
  capacity!: number;

  @ApiProperty({
    description: 'Url with picture of bulding',
    example: 'http://img.jpg',
  })
  @IsString()
  imgUrl!: string | null;

  @ApiProperty({
    description: 'latitude of the place ',
    example: '48.8584',
  })
  @IsString()
  @IsNotEmpty()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude of the place',
    example: '2.2945',
  })
  @IsString()
  @IsNotEmpty()
  longitude!: number;
}
