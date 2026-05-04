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
   # Configuración del entorno
   NODE_ENV=development
   PORT=5500
   CORS_ORIGIN=http://localhost:5173
   
   # Configuración de conexión a MongoDB
   DB_HOST=localhost
   DB_PORT=27017
   DB_NAME=gym
   
   # Activar logs de MikroORM (true o false)
   DB_DEBUG=true
   
   # JWT
   JWT_SECRET=mi_clave
   
   # Admin
   ADMIN_PASSWORD=miclavesegura
   ADMIN_SECRET=claveunicaadmin
   

   # Brevo
   BREVO_API_KEY=.... /*no podemos exponer esta clave ya que nos bajan la API de Brevo*/
   
   #stripe 
   STRIPE_SECRET_KEY=sk_test_51SVcSpIIoJE8DL7Ne81uae4Id6R3fvbLm49w8uWXRWyYWJ6SQabWXH3ZQqgJV7jzRKucjF11mQyKX38LCuctSz8w007zM7Q7bi
   STRIPE_WEBHOOK_SECRET= whsec_d4ce2f1a52d731cbc65795289c13f3f5f118238d6a445068592a8b4e041c9d66
    /*En una terminal ejecutar: stripe listen --events checkout.session.completed --forward-to http://127.0.0.1:5500/api/stripe/webhook  eso le dara su webhook secret local */
     ```

   Ejemplo para produccion:

   ```env
   # Configuración del entorno
   NODE_ENV=production
   PORT=5500
   CORS_ORIGIN=https://frontend-app-gym.vercel.app
   FRONTEND_URL=https://frontend-app-gym.vercel.app
   # Configuración de conexión a MongoDB
   MONGO_URL=mongodb+srv://gym_user:fitness@cluster0.6m6zi3w.mongodb.net/?appName=Cluster0
   
   # Activar logs de MikroORM (true o false)
   DB_DEBUG=false
   
   # JWT
   JWT_SECRET=mi_clave
   
   # Admin
   ADMIN_PASSWORD=miclavesegura
   ADMIN_SECRET=claveunicaadmin
   
   # Brevo
   BREVO_API_KEY=.... /*no podemos exponer esta clave ya que nos bajan la API de Brevo*/
   
   #stripe 
   STRIPE_SECRET_KEY=sk_test_51SVcSpIIoJE8DL7Ne81uae4Id6R3fvbLm49w8uWXRWyYWJ6SQabWXH3ZQqgJV7jzRKucjF11mQyKX38LCuctSz8w007zM7Q7bi
   STRIPE_WEBHOOK_SECRET= whsec_PuB4EO7Viy8ShfecQigebc9woDUc9plY

   ```

4. **Poblar Base de Datos:**
   ```bash
   pnpm run seed
   ```
5. **Iniciar en modo desarrollo:**

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
