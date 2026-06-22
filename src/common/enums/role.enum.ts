export enum Role {
  USER = 'user',
  PRODUCER = 'producer',
  ADMIN = 'admin',
  SCANNER = 'scanner', // Solo puede escanear tickets — sin acceso a datos del evento
}