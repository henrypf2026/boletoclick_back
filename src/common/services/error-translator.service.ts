import { Injectable } from '@nestjs/common';

@Injectable()
export class ErrorTranslatorService {
  private readonly errorMap: Record<string, string> = {
    'User already registered':
      'El usuario ya está registrado con este correo electrónico',
    'Invalid login credentials': 'Correo o contraseña incorrectos',
    'Email not confirmed': 'Por favor confirma tu correo electrónico',
    'User not found': 'Usuario no encontrado',
    'Password too short': 'La contraseña debe tener al menos 6 caracteres',
    'Invalid email': 'El correo electrónico no es válido',
    'User session not found':
      'Sesión expirada, por favor inicia sesión de nuevo',
    'Signup disabled': 'El registro de nuevos usuarios está deshabilitado',
    'Email change emailed': 'Se envió un enlace de confirmación a tu correo',
    'User already exists': 'El usuario ya existe',
  };

  /**
   * Traduce un mensaje de error de Supabase al español.
   * Si el error no está en el mapa, retorna el mensaje original.
   */
  translateSupabaseError(error: string): string {
    // Buscar coincidencia exacta
    if (this.errorMap[error]) {
      return this.errorMap[error];
    }

    // Buscar coincidencia parcial (para casos donde Supabase agrega más detalles)
    for (const [key, translation] of Object.entries(this.errorMap)) {
      if (error.includes(key)) {
        return translation;
      }
    }

    // Si no hay traducción, retornar el original
    return error;
  }
}
