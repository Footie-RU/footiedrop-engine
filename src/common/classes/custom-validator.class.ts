/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isPhoneNumber } from 'class-validator';

@ValidatorConstraint({ name: 'isRussianPhoneNumber', async: false })
export class IsRussianPhoneNumberConstraint
  implements ValidatorConstraintInterface
{
  validate(phoneNumber: string, args: ValidationArguments) {
    return isPhoneNumber(phoneNumber, 'RU');
  }

  defaultMessage(args: ValidationArguments) {
    return 'Phone number ($value) is not a valid Russian phone number!';
  }
}
