export enum EventStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE', // 🛠️ Legado: ya no se usa en la lógica activa. Unificado bajo APPROVED.
  SOLDOUT = 'SOLDOUT',
  CANCELLED = 'CANCELLED',
  INACTIVE = 'INACTIVE',
  APPROVED = 'APPROVED', // Evento visible/publicado (antes resultado de moderación, ahora estado por default al crear)
  PENDING = 'PENDING', // Legado: ya no se usa en el flujo de creación (antes pasaba por moderación previa)
  REJECTED = 'REJECTED', // El admin lo dio de baja
}
