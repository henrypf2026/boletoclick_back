export const mockEvents = [
  {
    title: 'Cruz Azul vs Chivas',
    description:
      'Semifinal Clausura 2026. Vive la máxima intensidad del fútbol mexicano...',
    venueName: 'Estadio Ciudad de los Deportes', // 👈 Para buscar el UUID real en la BD
    categorySlug: 'partidos', // 👈 Para buscar el UUID real en la BD
    eventDate: '2026-06-15T21:00:00.000Z',
    ticketTypes: [
      { name: 'General', price: 500.0, stock: 120, zone: 'Platea Baja' },
      {
        name: 'Preferente',
        price: 950.0,
        stock: 80,
        zone: 'Primer Piso Lateral',
      },
      { name: 'VIP', price: 1850.0, stock: 40, zone: 'Palcos Centrales' },
    ],
  },
  {
    title: 'América vs Pumas',
    description:
      'Clásico Capitalino. Una batalla histórica en el coloso de Santa Úrsula...',
    venueName: 'Estadio Azteca',
    categorySlug: 'partidos',
    eventDate: '2026-06-20T19:00:00.000Z',
    ticketTypes: [
      { name: 'General', price: 450.0, stock: 200, zone: 'Cabecera Norte' },
      { name: 'Preferente', price: 890.0, stock: 90, zone: 'Especial Bajo' },
      { name: 'Palco', price: 2200.0, stock: 20, zone: 'Zona de Palcos VIP' },
    ],
  },
  {
    title: 'EMPIRE MMA 15',
    description: 'Noche de campeonato de Artes Marciales Mixtas...',
    venueName: 'Arena CDMX',
    categorySlug: 'mma',
    eventDate: '2026-06-25T23:00:00.000Z',
    ticketTypes: [
      { name: 'General', price: 350.0, stock: 300, zone: 'Gradas Superiores' },
      {
        name: 'Ringside',
        price: 1200.0,
        stock: 50,
        zone: 'Fila A-C junto a la Jaula',
      },
    ],
  },
  {
    title: 'Bad Bunny World Tour',
    description:
      'Solo en México. El fenómeno global de la música urbana regresa...',
    venueName: 'Foro Sol',
    categorySlug: 'conciertos',
    eventDate: '2026-06-30T20:30:00.000Z',
    ticketTypes: [
      { name: 'Gramilla', price: 890.0, stock: 45, zone: 'Pista Verde A' },
      { name: 'Preferente', price: 1450.0, stock: 120, zone: 'Grada Naranja' },
      { name: 'VIP', price: 3200.0, stock: 15, zone: 'Pit Frontal Izquierdo' },
    ],
  },
  {
    title: 'Chivas vs Atlas',
    description: 'Clásico Tapatío. La rivalidad más antigua de Guadalajara...',
    venueName: 'Estadio Akron',
    categorySlug: 'partidos',
    eventDate: '2026-07-05T19:06:00.000Z',
    ticketTypes: [
      { name: 'General', price: 280.0, stock: 500, zone: 'Cabecera Sur' },
      { name: 'Preferente', price: 620.0, stock: 150, zone: 'Chivas Premier' },
    ],
  },
  {
    title: 'Festival Reggae Invasion',
    description:
      'Protoje meets Tippy I. Una experiencia inmersiva de raíces...',
    venueName: 'Teatro Metropolitan',
    categorySlug: 'otros',
    eventDate: '2026-07-12T23:00:00.000Z',
    ticketTypes: [
      { name: 'General', price: 420.0, stock: 180, zone: 'Balcón E' },
      { name: 'Premium', price: 780.0, stock: 60, zone: 'Preferente Centro' },
    ],
  },
];
