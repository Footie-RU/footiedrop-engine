import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsArray,
  ValidateNested,
  IsDefined,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../interfaces/orders.interface';

// DTO for Sender
class SenderDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}

// DTO for Recipient
class RecipientDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}

// DTO for Package
class PackageDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly type: string;

  @IsNumber()
  @IsNotEmpty()
  readonly quantity: number;

  @IsString()
  @IsNotEmpty()
  readonly size: string;

  @IsString()
  readonly image: string;

  @IsString()
  @IsNotEmpty()
  readonly modeOfDelivery: string;

  @IsString()
  readonly message: string;
}

// DTO for Pickup and Delivery locations
class LocationDto {
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @IsNotEmpty()
  @IsString()
  readonly state: string;

  @IsNotEmpty()
  @IsString()
  readonly postalCode: string;

  @IsNotEmpty()
  @IsString()
  readonly floorOrApartment: string;

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  readonly locationType: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => Number)
  readonly coordinates: number[];

  @IsNotEmpty()
  @IsString()
  readonly estimatedTime: string;
}

// DTO for Details
class DetailsDto {
  @ValidateNested()
  @Type(() => SenderDto)
  readonly sender: SenderDto;

  @ValidateNested()
  @Type(() => RecipientDto)
  readonly recipient: RecipientDto;

  @ValidateNested()
  @Type(() => PackageDto)
  readonly package: PackageDto;
}

// DTO for Payment
class PaymentDto {
  @IsNumber()
  @IsNotEmpty()
  readonly price: number;
}

// DTO for NewOrder
export class CreateOrderDto {
  @ValidateNested()
  @IsDefined({ message: 'Location is required' })
  readonly location: {
    pickup: LocationDto;
    delivery: LocationDto;
  };

  @ValidateNested()
  @IsDefined({ message: 'Details are required' })
  @Type(() => DetailsDto)
  readonly details: DetailsDto;

  @ValidateNested()
  @IsDefined({ message: 'Payment is required' })
  @Type(() => PaymentDto)
  readonly payment: PaymentDto;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  readonly status: OrderStatus;

  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;
}

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @IsNotEmpty()
  @IsUUID()
  readonly orderId: string;
}
