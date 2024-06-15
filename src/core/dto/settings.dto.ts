import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Validate,
  IsOptional,
  IsBoolean,
  Matches,
  MaxLength,
  MinLength,
  IsIn,
  IsEnum,
} from 'class-validator';
import { IsRussianPhoneNumberConstraint } from '../../common/classes/custom-validator.class';
import { Match } from '../decorators/match.decorator';
import { IsDifferent } from '../decorators/is-different.decorator';
import { UserRole } from '../interfaces/user.interface';

/**
 * Change email address
 */
export class ChangeEmailDto {
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
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  readonly addressStreet: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  readonly addressCity: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly addressState: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly floor: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly apartment_number: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly zip_code: string;

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
export class ChangeProfilePictureDto {}

export class updateProfileDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly middlename: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  readonly role: UserRole;
}

/** Update Communication preferences */
export class UpdateCommunicationPreferencesDto {
  @IsBoolean()
  @IsNotEmpty()
  readonly notificationsEmail: boolean;

  @IsBoolean()
  @IsNotEmpty()
  readonly notificationsSms: boolean;

  @IsBoolean()
  @IsNotEmpty()
  readonly securityTwoFactorAuth: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  readonly currentPassword: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message: 'Password too weak',
  })
  @IsDifferent('currentPassword', {
    message: 'New password must be different from current password',
  })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  readonly newPassword: string;

  @Match('newPassword', { message: 'Passwords do not match' })
  @MinLength(4)
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  readonly confirmNewPassword: string;
}

export class ChangeLanguageDto {
  @IsIn(['en', 'ru', 'fr'], { message: 'Invalid language selection' })
  readonly language: string;
}
