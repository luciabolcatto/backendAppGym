# Gym App - Backend API

Servidor para la gestión de gimnasios, construido con **Node.js**, **TypeScript**, **Express** y **MikroORM** con persistencia en **MongoDB**.

## Stack Tecnológico

- **Core:** Node.js (ES Modules) & TypeScript.
- **Framework:** Express 5.
- **ORM:** MikroORM v5 (MongoDB).
- **Autenticación y seguridad:** JSON Web Tokens (JWT) y bcrypt.
- **Subida de imágenes:** Multer.
- **Carga de variables de entorno:** dotenv.
- **Control de acceso entre frontend y backend:** cors.
- **Soporte de metadatos para decoradores:** reflect-metadata.
- **Manejo de fechas y horas:** luxon.
- **Pagos:** Stripe API.
- **Mailing:** Brevo.
- **Tareas Programadas:** Node-cron (Automatización de vencimientos).
- **Testing:** Jest.

## Requisitos

- **Node.js**: v22.15.0 (recomendado)
- **pnpm** (se recomienda) — instalar: `npm i -g pnpm`
- **MongoDB**: local o remoto (ver sección de variables de entorno)
- **Docker** (opcional) para ejecutar MongoDB vía `docker-compose`
- **TypeScript**: v5.9.2

## Estructura de Proyecto

Organizado por módulos de dominio para escalabilidad:

- `actividad/`, `clase/`, `contrato/`, `reserva/`, `usuario/`, `valoracion/`, `membresia/`: Entidades, controladores y lógica de negocio.
- `middleware/`: Seguridad y validaciones (Auth JWT).
- `shared/`: Configuración de base de datos y scripts de `seed`.
- `stripe/`: Integración de pasarela de pagos y Webhooks.

## Instalación y Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```
2. **Configurar variables de entorno en** `.env`

   Ejemplo para desarrollo:

   ```env
   # Entorno
   NODE_ENV=development
   PORT=5500
   CORS_ORIGIN=http://localhost:5173

   # Configuración de conexión a MongoDB
   DB_HOST=localhost
   DB_PORT=27017
   DB_NAME=gym

   # Logs de MikroORM
   DB_DEBUG=true

   # Seguridad
   JWT_SECRET=your_jwt_secret
   ADMIN_PASSWORD=your_admin_password
   ADMIN_SECRET=your_admin_secret

   # Integraciones (use placeholders)
   BREVO_API_KEY=your_brevo_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

   Para obtener el `STRIPE_WEBHOOK_SECRET` en local ejecutar:

   ```bash
   stripe listen --events checkout.session.completed --forward-to http://127.0.0.1:5500/api/stripe/webhook
   ```

   y copiar el valor `whsec_...` que imprime Stripe.

   Ejemplo para produccion:

   ```env
   # Entorno
   NODE_ENV=production
   PORT=5500
   CORS_ORIGIN=https://frontend-app-gym.vercel.app
   FRONTEND_URL=https://frontend-app-gym.vercel.app

   # Usar MONGO_URL para conexión remota
   MONGO_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/gym?retryWrites=true&w=majority

   DB_DEBUG=false

   JWT_SECRET=your_jwt_secret
   ADMIN_PASSWORD=your_admin_password
   ADMIN_SECRET=your_admin_secret

   BREVO_API_KEY=your_brevo_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   ```

3. **Poblar Base de Datos:**

   ```bash
   pnpm run seed
   ```

   Nota: El script de `seed` " genera datos realistas y concistentes en la base de datos (MongoDB). Los registros cuentan con fechas actualizadas para permitir       una evaluación precisa de los flujos de trabajo y la gestión de turnos/pagos en tiempo real.Ademas borra datos existentes antes de ejecutarlo.

4. **Iniciar en modo desarrollo:**

   ```bash
   pnpm run start:dev

   ```

## Testing

El proyecto implementa pruebas automatizadas para garantizar la integridad de la lógica de negocio:

- `pnpm test`: Ejecuta los tests unitarios y el de integración (automático).
- `pnpm test:unit`: Ejecuta todos los tests unitarios.
- `pnpm test:auth`: Pruebas de seguridad y JWT.
- `pnpm test:usuario`: Pruebas del controlador de usuarios.
- `pnpm test:contrato`: Lógica de creación y estados de membresías.
- `pnpm test:reserva`: Validación de cupos y horarios.
- `pnpm test:integration`: Pruebas de flujo completo (pago manual con Stripe) con base de datos de test (`gym_test`).
- `pnpm test:integration:efectivo`: Simulación del flujo de pago automático con base de datos de test (`gym_test`).

## Producción

1. **Build:** `pnpm run build` (Genera la carpeta `/dist`).
2. **Start:** `pnpm start`.

## Deploy

El backend se encuentra desplegado y operativo en la plataforma Render (https://backendappgym.onrender.com/).
