# BoletoClick API 🎫🚀

BoletoClick API es el motor de backend desarrollado para la gestión integral, reserva y venta de boletos (tickets) para eventos. La plataforma permite a los organizadores publicar sus eventos especificando locaciones, categorías y tipos de boletos con stocks dinámicos, mientras que facilita a los compradores una adquisición de entradas segura, validada mediante códigos QR únicos y con procesamiento de pagos integrado en tiempo real.

---

## 🏗️ Enfoques de Arquitectura y Optimización

* **Modular y Altamente Escalable:** Desarrollada bajo el patrón arquitectónico modular nativo de **NestJS**, lo que garantiza un código desacoplado, altamente mantenible y con una clara separación de dominios.
* **Concurrencia y Consistencia (Ticket Locking):** Implementa un sistema de bloqueo temporal de boletos para asegurar el stock seleccionado por el usuario durante el flujo de pago, evitando la sobreventa en eventos de alta demanda antes de que se complete la transacción.
* **Seguridad y Control de Carga:** Incorpora un limitador de tasa de peticiones (*rate-limiting/throttler*) configurado por niveles dinámicos (picos rápidos/*burst* y límites por minuto) para proteger la API de ataques de denegación de servicio (DoS) y picos masivos de tráfico concurrente.
* **Procesamiento Asíncrono de Eventos y Tareas:** Uso de eventos internos asíncronos y tareas programadas de fondo (*cron jobs*) para la automatización del envío de boletines informativos (*newsletters*) y notificaciones por correo electrónico sin bloquear el hilo principal de ejecución.

---

## 🛠️ Stack Tecnológico y Requisitos

### Entorno de Ejecución y Lenguajes
* **Runtime:** Node.js (v18+ recomendado)
* **Lenguaje:** TypeScript
* **Framework Principal:** NestJS

### Persistencia y Almacenamiento
* **Base de Datos:** PostgreSQL (Alojada y gestionada a través de **Supabase**).
* **ORM:** **TypeORM** para el mapeo objeto-relacional y el control estructurado de entidades.
* **Storage de Archivos:** **Cloudinary** SDK (para almacenamiento en la nube de imágenes de eventos y perfiles) y **Supabase Storage**.

### Librerías y Herramientas Clave
* **Autenticación y Seguridad:** JSON Web Tokens (`@nestjs/jwt`), cookies firmadas mediante `cookie-parser` y `@nestjs/throttler` para rate-limiting.
* **Validación de Datos:** `class-validator` y `class-transformer` para validación estricta a nivel global de DTOs (*Data Transfer Objects*).
* **Pasarela de Pagos:** **Stripe** SDK con integración robusta de Webhooks para la escucha y confirmación asíncrona del estado de las órdenes.
* **Servicio de Emails:** **Brevo** (`@getbrevo/brevo`) para el envío automatizado de correos transaccionales (confirmaciones de compra, tickets con QR) y campañas de newsletter.
* **Inteligencia Artificial:** **OpenAI** SDK para el procesamiento de lenguaje natural en el chatbot interactivo de asistencia al cliente.
* **Generación de QRs:** `qrcode` para la creación y anexado de códigos de validación únicos para cada boleto adquirido.
* **Documentación:** **Swagger** (`@nestjs/swagger` y `swagger-ui-express`) para la generación automática de la interfaz interactiva de la API.

---

## 🎯 Casos de Uso y Módulos de la API

La API expone sus funcionalidades agrupadas de forma modular en los siguientes endpoints principales:

* **Autenticación y Usuarios (`/auth`, `/users`):** Registro de usuarios, inicio de sesión seguro, asignación/validación de roles y gestión de perfiles.
* **Eventos y Ubicaciones (`/events`, `/categories`, `/province`, `/municipalities`):** Publicación de eventos con categorización detallada y filtros geográficos adaptados específicamente a provincias y municipios dominicanos.
* **Gestión de Boletos (`/tickets`, `/ticket-types`, `/ticket-locks`):** Configuración paramétrica de tipos de boletos (precios, stock disponible), control del ciclo de vida de la entrada y reservas temporales de stock (*locks*).
* **Órdenes y Pagos (`/orders`, `/payments/webhook`):** Orquestación del flujo de compras, integración directa con el checkout de Stripe y conciliación automática del inventario tras la recepción del Webhook exitoso.
* **Favoritos y Descuentos (`/favorites`, `/coupons`):** Registro de eventos de interés para el usuario y motor de aplicación de cupones de descuento sobre el precio de las órdenes.
* **Chatbot con IA (`/chatbot`):** Ventana de asistencia interactiva que consume modelos de OpenAI para responder preguntas en tiempo real sobre la plataforma y eventos activos.
* **Monitoreo de Ubicaciones (`/venues`, `/maps`):** Coordinación física e identificación de los establecimientos y recintos donde se ejecutan los eventos.

---

## 🚀 Instalación y Ejecución en Local

### Requisitos Previos
* Node.js (Versión 18 o superior)
* Cuenta activa en Supabase (Instancia de PostgreSQL)
* Credenciales de desarrollo para Stripe, Brevo, Cloudinary y OpenAI.

### Pasos para la Puesta en Marcha

1. **Clonar el repositorio y navegar al directorio del backend:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd PF/api

2. **Instalar las dependencias del proyecto:**
   ```bash
   npm install

3. **Configurar las variables de entorno:**
Copia el archivo de plantilla para entorno de desarrollo:
   ```bash
   cp .env.example .env.development

Abre el archivo `.env.development` recién creado y rellena las variables obligatorias con tus credenciales:
* Configuración de Servidor (`PORT`, `JWT_SECRET`, etc.)
* Base de datos de Supabase/PostgreSQL (`DATABASE_URL` u opciones por separado)
* API Keys de Stripe, Brevo, Cloudinary y OpenAI.


4. **Levantar el servidor en modo desarrollo (Watch Mode):**
   ```bash
   npm run start:dev

El servidor se iniciará por defecto en el puerto `3001` (o el especificado en tu `.env`).

5. **Base de Datos y Sincronización:**
* **En desarrollo:** El proyecto tiene habilitada la propiedad `synchronize: true` de TypeORM para reflejar automáticamente cualquier cambio de las entidades en el esquema de la base de datos al guardar.
* **En producción:** Se recomienda desactivar la sincronización automática y utilizar el CLI de TypeORM para generar y correr migraciones controladas:

---

## 📊 Demostraciones y Producción

### Documentación Interactiva (Swagger)

Puedes visualizar, interactuar y probar cada uno de los endpoints de la API utilizando la interfaz integrada de Swagger de manera local o en producción:

* **Local:** [http://localhost:3001/api](https://www.google.com/search?q=http://localhost:3001/api) *(Ajustar puerto si es diferente)*

### Enlace de Despliegue (Deploy)

La API se encuentra desplegada y completamente operativa en el siguiente entorno de producción:

* **Live API (Swagger):** [https://boletoclickback-production.up.railway.app/api](https://boletoclickback-production.up.railway.app/api)