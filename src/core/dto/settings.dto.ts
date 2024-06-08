import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Validate,
  IsOptional,
} from 'class-validator';
import { IsRussianPhoneNumberConstraint } from '../../common/classes/custom-validator.class';

/**
 * Change email address
 */
export class ChangeEmailDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsEmail()
  @IsNotEmpty()
  readonly newEmail: string;
}

/**
 * Change phone number
 */
export class ChangePhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @Validate(IsRussianPhoneNumberConstraint, {
    message: 'Phone number must be a valid Russian phone number!',
  })
  @IsNotEmpty()
  readonly newPhoneNumber: string;
}

/**
 * Change address
 */
export class ChangeAddressDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  readonly addressStreet: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  readonly addressCity: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  readonly addressState: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  readonly addressPostalCode: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  readonly addressCountry: string;
}

/**
 * Change Profile Picture
 */
export class ChangeProfilePictureDto {
  @IsNotEmpty()
  readonly userId: string;

  @IsNotEmpty()
  readonly profilePicture: string;
}
