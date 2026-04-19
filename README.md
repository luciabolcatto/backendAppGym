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

2. Configurar variables de entorno en `.env`(las claves no son las reales):

   ```env
   # Entorno
   NODE_ENV=production
   PORT=5500
   FRONTEND_URL=http://localhost:5173
   CORS_ORIGIN=http://localhost:5173

   # Base de datos
   MONGO_URL=mongodb+srv://<usuario>:<password>@<cluster>/<db>
   DB_DEBUG=false

   # Auth
   JWT_SECRET=<jwt_secret>
   ADMIN_PASSWORD=<admin_password>
   ADMIN_SECRET=<admin_secret>

   # Email
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

## Tests

```bash
pnpm test
```

Atajos útiles:

- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:integration:efectivo`

## Deploy

El backend está desplegado en Render.

## Notas

- El backend permite CORS para `FRONTEND_URL`, `CORS_ORIGIN` y `http://localhost:5173`.
- Se sirven archivos estáticos en `/public`.
