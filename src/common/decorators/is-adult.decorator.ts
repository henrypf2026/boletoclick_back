import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAdult', async: false })
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value) return false;

    const birthDate = new Date(value);
    if (isNaN(birthDate.getTime())) return false; // Evita fechas rotas

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    const minAgeRequired = args.constraints[0] || 18;
    return age >= minAgeRequired;
  }

  defaultMessage(args: ValidationArguments): string {
    const minAgeRequired = args.constraints[0] || 18;
    return `Debes ser mayor de ${minAgeRequired} años para registrarte.`;
  }
}

export function IsAdult(
  minAge: number = 18,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge],
      validator: IsAdultConstraint,
    });
  };
}
