# backendAppGym

Repositorio del backend de la app fullstack de la materia desarrollo de software, UTN FRRO ISI COM 304.

## Deploy en Render

1. Crear un Web Service desde este repositorio.
2. Usar como build command: `pnpm install && pnpm build`.
3. Usar como start command: `pnpm start`.
4. Configurar estas variables de entorno:
   - `MONGO_URL`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`
   - `ADMIN_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
5. Si usas Stripe, registrar el webhook en la URL pública del backend: `/api/stripe/webhook`.
