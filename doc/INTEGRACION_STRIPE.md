# 💳 Integración de Pagos - Documentación

## 📋 Descripción General

Esta documentación describe la integración de **múltiples métodos de pago** para procesar pagos de membresías en el sistema del gimnasio:

- **Stripe Checkout**: Pagos con tarjeta de crédito/débito (real)
- **Transferencia Bancaria**: Pagos simulados con comprobante
- **Efectivo**: Pagos simulados en persona

## 🎯 Métodos de Pago Disponibles

| Método           | Código          | Descripción                          | Tipo     |
| ---------------- | --------------- | ------------------------------------ | -------- |
| Tarjeta (Stripe) | `stripe`        | Pago con tarjeta vía Stripe Checkout | Real     |
| Transferencia    | `transferencia` | Pago con comprobante bancario        | Simulado |
| Efectivo         | `efectivo`      | Pago en persona                      | Simulado |

### Endpoint para obtener métodos disponibles

```http
GET /api/stripe/metodos-pago
```

**Response:**

```json
{
  "metodos": [
    {
      "id": "stripe",
      "nombre": "Tarjeta de Crédito/Débito",
      "descripcion": "Pago seguro con Stripe"
    },
    {
      "id": "transferencia",
      "nombre": "Transferencia Bancaria",
      "descripcion": "Transferencia a cuenta bancaria"
    },
    {
      "id": "efectivo",
      "nombre": "Efectivo",
      "descripcion": "Pago en efectivo en recepción"
    }
  ]
}
```

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```env
# Stripe - Modo Test
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Frontend URL para redirecciones
FRONTEND_URL=http://localhost:5174
```

### 2. Obtener las Claves de Stripe

1. Acceder a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Ir a **Developers** → **API keys**
3. Copiar la **Secret key** (empieza con `sk_test_`)
4. Guardarla en `STRIPE_SECRET_KEY`

### 3. Configurar Webhook (Desarrollo Local)

Para probar webhooks en desarrollo local, necesitas **Stripe CLI**:

#### Instalación de Stripe CLI

**Windows (winget):**

```powershell
winget install Stripe.StripeCLI
```

**Windows (descarga directa):**

1. Descargar desde https://github.com/stripe/stripe-cli/releases
2. Extraer y agregar al PATH

#### Autenticación

```powershell
stripe login
```

Esto abrirá el navegador para autenticarte con tu cuenta de Stripe.

#### Iniciar el Listener de Webhooks

```powershell
stripe listen --forward-to localhost:5500/api/stripe/webhook
```

Este comando:

- Escucha eventos de Stripe
- Los reenvía a tu servidor local
- Muestra un **webhook signing secret** (whsec\_...) que debes copiar a tu `.env`

⚠️ **Importante**: Mantén esta terminal abierta mientras pruebas pagos con tarjeta.

---

## 🔄 Flujos de Pago

### Flujo 1: Pago con Tarjeta (Stripe Checkout)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────>│   Backend   │────>│   Stripe    │────>│   Webhook   │
│             │     │             │     │             │     │             │
│ 1. Click    │     │ 2. Crear    │     │ 3. Checkout │     │ 5. Evento   │
│    "Pagar"  │     │    Session  │     │    Page     │     │    recibido │
│             │     │             │     │             │     │             │
│ 4. Redirect │<────│             │     │             │────>│ 6. Actualiza│
│    Checkout │     │             │     │             │     │    Contrato │
│             │     │             │     │             │     │             │
│ 7. Success  │<────────────────────────│             │     │             │
│    Page     │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Flujo 2: Pago con Transferencia Bancaria

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────>│   Backend   │
│             │     │             │
│ 1. Selecciona     │ 2. Procesa  │
│    Transferencia  │    pago     │
│             │     │             │
│ 3. Ingresa  │────>│ 4. Actualiza│
│    comprobante    │    contrato │
│             │     │    a PAGADO │
│ 5. Success  │<────│             │
│    Page     │     │             │
└─────────────┘     └─────────────┘
```

### Flujo 3: Pago en Efectivo

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────>│   Backend   │
│             │     │             │
│ 1. Selecciona     │ 2. Procesa  │
│    Efectivo │     │    pago     │
│             │     │             │
│ 3. Confirmar│────>│ 4. Actualiza│
│    pago     │     │    contrato │
│             │     │    a PAGADO │
│ 5. Success  │<────│             │
│    Page     │     │             │
└─────────────┘     └─────────────┘
```

---

## 📡 Endpoints de la API

### GET `/api/stripe/metodos-pago`

Obtiene los métodos de pago disponibles.

**Response (200):**

```json
{
  "metodos": [
    {
      "id": "stripe",
      "nombre": "Tarjeta de Crédito/Débito",
      "descripcion": "..."
    },
    {
      "id": "transferencia",
      "nombre": "Transferencia Bancaria",
      "descripcion": "..."
    },
    { "id": "efectivo", "nombre": "Efectivo", "descripcion": "..." }
  ]
}
```

---

### POST `/api/stripe/create-checkout-session`

Crea una sesión de pago con Stripe para un contrato pendiente.

**Request:**

```json
{
  "contratoId": "string"
}
```

**Response exitosa (200):**

```json
{
  "message": "Sesión de pago creada exitosamente",
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

**Errores posibles:**

- `400`: Contrato no está en estado pendiente
- `404`: Contrato no encontrado

---

### POST `/api/stripe/pagar-transferencia`

Procesa un pago por transferencia bancaria (simulado).

**Request:**

```json
{
  "contratoId": "string",
  "comprobanteNumero": "string"
}
```

**Response exitosa (200):**

```json
{
  "message": "Pago por transferencia procesado exitosamente",
  "contrato": {
    "id": "...",
    "estado": "pagado",
    "metodoPago": "transferencia",
    "comprobanteNumero": "TRF-123456789"
  }
}
```

**Errores posibles:**

- `400`: Contrato no está en estado pendiente o falta número de comprobante
- `404`: Contrato no encontrado

---

### POST `/api/stripe/pagar-efectivo`

Procesa un pago en efectivo (simulado).

**Request:**

```json
{
  "contratoId": "string"
}
```

**Response exitosa (200):**

```json
{
  "message": "Pago en efectivo procesado exitosamente",
  "contrato": {
    "id": "...",
    "estado": "pagado",
    "metodoPago": "efectivo"
  }
}
```

**Errores posibles:**

- `400`: Contrato no está en estado pendiente
- `404`: Contrato no encontrado

---

### GET `/api/stripe/session/:sessionId`

Verifica el estado de una sesión de pago de Stripe.

**Response (200):**

```json
{
  "sessionId": "cs_test_...",
  "status": "complete",
  "paymentStatus": "paid",
  "contrato": {
    "id": "...",
    "estado": "pagado",
    "membresia": "Plan Mensual"
  }
}
```

---

### POST `/api/stripe/webhook`

Endpoint que recibe eventos de Stripe. No llamar manualmente.

**Eventos manejados:**

- `checkout.session.completed`: Actualiza contrato a PAGADO
- `checkout.session.expired`: Limpia el sessionId del contrato

---

## 🧪 Testing

### Tarjetas de Prueba de Stripe

| Escenario                 | Número de Tarjeta     |
| ------------------------- | --------------------- |
| ✅ Pago exitoso           | `4242 4242 4242 4242` |
| ❌ Pago rechazado         | `4000 0000 0000 0002` |
| 🔐 Requiere autenticación | `4000 0025 0000 3155` |

- **Fecha de vencimiento**: Cualquier fecha futura (ej: 12/34)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquiera (ej: 12345)

### Flujo de Prueba - Tarjeta (Stripe)

1. **Iniciar el servidor**:

   ```powershell
   pnpm run start:dev
   ```

2. **Iniciar Stripe CLI** (en otra terminal):

   ```powershell
   stripe listen --forward-to localhost:5500/api/stripe/webhook
   ```

3. **Crear un contrato**:

   ```http
   POST http://localhost:5500/api/Contratos/contratar
   Content-Type: application/json

   {
     "usuarioId": "ID_DEL_USUARIO",
     "membresiaId": "ID_DE_LA_MEMBRESIA"
   }
   ```

4. **Crear sesión de checkout**:

   ```http
   POST http://localhost:5500/api/stripe/create-checkout-session
   Content-Type: application/json

   {
     "contratoId": "ID_DEL_CONTRATO"
   }
   ```

5. **Abrir la URL** retornada en `checkoutUrl` en el navegador

6. **Completar el pago** con tarjeta de prueba `4242 4242 4242 4242`

7. **Verificar** que el contrato cambió a estado `pagado`

### Flujo de Prueba - Transferencia

1. **Crear un contrato** (igual que arriba)

2. **Procesar pago por transferencia**:

   ```http
   POST http://localhost:5500/api/stripe/pagar-transferencia
   Content-Type: application/json

   {
     "contratoId": "ID_DEL_CONTRATO",
     "comprobanteNumero": "TRF-123456789"
   }
   ```

3. **Verificar** que el contrato cambió a estado `pagado`

### Flujo de Prueba - Efectivo

1. **Crear un contrato** (igual que arriba)

2. **Procesar pago en efectivo**:

   ```http
   POST http://localhost:5500/api/stripe/pagar-efectivo
   Content-Type: application/json

   {
     "contratoId": "ID_DEL_CONTRATO"
   }
   ```

3. **Verificar** que el contrato cambió a estado `pagado`

---

## 📁 Estructura de Archivos

```
src/
├── stripe/
│   ├── stripe.controller.ts   # Lógica de todos los pagos
│   ├── stripe.routes.ts       # Rutas de la API
│   └── stripe.http            # Archivo de testing
├── contrato/
│   └── contrato.entity.ts     # Incluye stripeSessionId
└── app.ts                     # Configuración del webhook
```

---

## ⚠️ Consideraciones Importantes

### Webhook y express.json()

El webhook de Stripe **DEBE** recibir el body como raw (sin parsear). Por eso en `app.ts` el webhook se configura **ANTES** de `express.json()`:

```typescript
// Webhook ANTES de express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), ...);

// Luego el parser JSON para el resto de rutas
app.use(express.json());
```

### Sesiones de Checkout

- Las sesiones expiran después de 30 minutos
- Si una sesión expira, el usuario puede crear una nueva
- El `stripeSessionId` se guarda en el contrato para tracking

### Moneda

Los pagos con Stripe se procesan en **USD (Dólares)** en modo test, **ARS** en producción.

### Pagos Simulados

Los pagos por transferencia y efectivo son **simulados** y se procesan inmediatamente. En un entorno real, estos requerirían:

- **Transferencia**: Verificación manual del comprobante
- **Efectivo**: Confirmación del personal en recepción

---

## 🚀 Producción

Para producción, necesitas:

1. **Cambiar a claves de producción** (sin `_test_`)
2. **Crear webhook en Dashboard de Stripe**:
   - URL: `https://tudominio.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `checkout.session.expired`
3. **Actualizar `STRIPE_WEBHOOK_SECRET`** con el secret de producción
4. **Actualizar `FRONTEND_URL`** con tu dominio de producción
5. **Implementar verificación real** para transferencias y efectivo

---

## 📚 Referencias

- [Stripe Checkout Documentation](https://docs.stripe.com/payments/checkout)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Stripe CLI](https://docs.stripe.com/stripe-cli)
- [Stripe Testing](https://docs.stripe.com/testing)

---

**Última actualización**: Enero 2025  
**Versión de Stripe SDK**: 20.0.0
