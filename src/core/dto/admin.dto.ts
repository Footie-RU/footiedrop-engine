import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
  IsEnum,
  Validate,
} from 'class-validator';
import { IsRussianPhoneNumberConstraint } from 'src/common/classes/custom-validator.class';
import { Match } from '../decorators/match.decorator';
import { Languages } from '../interfaces/index.interface';
import { AdminRoles } from '../interfaces/user.interface';
/**
 * Data transfer object for creating a user
 * @export CreateAdminDto
 * @class CreateAdminDto
 * @implements {CreateAdminDto}
 */
export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly middlename: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message: 'Password too weak',
  })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  readonly password: string;

  @Match('password', { message: 'Passwords do not match' })
  @MinLength(4)
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  readonly confirmPassword: string;

  @IsEnum(AdminRoles)
  @IsNotEmpty()
  readonly role: AdminRoles;

  @Validate(IsRussianPhoneNumberConstraint, {
    message: 'Phone number must be a valid Russian phone number!',
  })
  @IsNotEmpty()
  readonly phone: string;

  @IsEnum(Languages)
  @IsNotEmpty()
  readonly language: Languages;

  @IsString()
  @IsNotEmpty()
  readonly pass: string = 'Footiedrop@2024$#-()';
}
