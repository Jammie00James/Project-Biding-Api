import { USER_ROLE } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsNumber,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  @ValidateNested({ each: true }) // Validate the nested object
  @Type(() => Array<MilestoneDto>) // Transform the nested object to Location class
  milestones: MilestoneDto[];
}

export class MilestoneDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  note: string;
}

export class CreateBidDto {
  @IsString()
  @IsNotEmpty()
  note: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}
