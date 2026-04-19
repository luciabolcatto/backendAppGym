# Backend App Gym

Backend de la aplicación App Gym, construido con Node.js, TypeScript, Express y MongoDB.

## Requisitos

- Node.js 18+
- pnpm
- MongoDB accesible (Atlas o local)

## Desarrollo local

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Configurar variables de entorno en `.env` (ejemplo para producción):

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

   ```bash
   pnpm start:dev
   ```

## Build de producción

```bash
pnpm build
```

## Ejecutar en producción

```bash
pnpm start
```

## Scripts útiles

- `pnpm seed` - compila y ejecuta el seed de datos
- `pnpm test:unit` - tests unitarios
- `pnpm test:integration` - tests de integración
- `pnpm test:integration:efectivo` - integración para el flujo de efectivo

## Tests

```bash
pnpm test
```

## Deploy

El backend está desplegado en Render.

## CORS en producción

- `FRONTEND_URL` y `CORS_ORIGIN` deben coincidir con el dominio real del frontend en Vercel.

## Notas

- El backend permite CORS para `FRONTEND_URL`, `CORS_ORIGIN` y `http://localhost:5173`.
- Se sirven archivos estáticos en `/public`.
- No ejecutes `pnpm seed` en cada deploy de producción: el seed limpia y vuelve a crear datos.
