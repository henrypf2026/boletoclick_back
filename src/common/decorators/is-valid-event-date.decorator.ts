import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidEventDate', async: false })
export class IsValidEventDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value) return false;

    const eventDate = new Date(value);
    if (isNaN(eventDate.getTime())) return false; // Evita fechas con formatos rotos

    const now = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() + 1); // ➕ Suma exactamente 1 año al día de hoy

    // 💡 Tip pro: Le restamos 5 minutos al "ahora" real como un colchón de seguridad.
    // Esto evita que la petición rebote por los milisegundos de latencia que tarda el viaje de red.
    const pastBuffer = new Date(now.getTime() - 5 * 60 * 1000);

    return eventDate >= pastBuffer && eventDate <= maxDate;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'La fecha del evento no puede ser en el pasado ni superar el plazo máximo de un año a partir de hoy.';
  }
}

export function IsValidEventDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidEventDateConstraint,
    });
  };
}
