# Gym App - Backend API 

Servidor para la gestión de gimnasios, construido con **Node.js**, **TypeScript**, **Express** y **MikroORM** con persistencia en **MongoDB**.

## Stack Tecnológico
- **Core:** Node.js (ES Modules) & TypeScript.
- **Framework:** Express 5.
- **ORM:** MikroORM v5 (MongoDB).
- **Pagos:** Stripe API.
- **Mailing:** Nodemailer (Gmail).
- **Tareas Programadas:** Node-cron (Automatización de vencimientos).

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
2. **Configurar variables de entorno en `.env` ** (ejemplo para producción):

   ```env
   # Configuración del entorno
   NODE_ENV=production
   PORT=5500
   CORS_ORIGIN=https://frontend-app-gym.vercel.app
   FRONTEND_URL=https://frontend-app-gym.vercel.app

   # Configuración de conexión a MongoDB
   MONGO_URL=mongodb+srv://<usuario>:<password>@<cluster>/<db>?appName=Cluster0

   # Activar logs de MikroORM (true o false)
   DB_DEBUG=false

   # JWT
   JWT_SECRET=<jwt_secret>

   # Admin
   ADMIN_PASSWORD=<admin_password>
   ADMIN_SECRET=<admin_secret>

   # Email (nodemailer con Gmail)
   EMAIL_USER=<email_user>
   EMAIL_PASS=<email_pass>

   # Stripe
   STRIPE_SECRET_KEY=<stripe_secret_key>
   STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
   ```

3. Ejecutar backend en modo desarrollo:
4. **Poblar Base de Datos:**
   ```bash
   pnpm run seed
5. **Iniciar en modo desarrollo:**
    ```bash
   pnpm run start:dev
   
## Testing 
El proyecto implementa pruebas automatizadas para garantizar la integridad de la lógica de negocio:

- `pnpm test` (Ejecuta todas las suites).
- `pnpm test:unit` (Valida middlewares y controladores principales).
- `pnpm test:auth`: Pruebas de seguridad y JWT.
- `pnpm test:contrato`: Lógica de creación y estados de membresías.
- `pnpm test:reserva`: Validación de cupos y horarios.
- `pnpm test:integration`: Pruebas de flujo completo con base de datos de test (`gym_test`).
- `pnpm test:integration:efectivo`: Simulación del flujo de pago manual y activación de servicios.

## Producción
1. **Build:** `pnpm run build` (Genera la carpeta `/dist`).
2. **Start:** `pnpm start`.

## Deploy
El backend se encuentra desplegado y operativo en la plataforma Render (onrender.com).

