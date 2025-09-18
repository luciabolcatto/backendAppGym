# Caso de Uso Implementado: Contratar Plan

## Descripción General

Sistema completo para la contratación de membresías por parte de los usuarios del gimnasio, con simulación de sistema de pagos para desarrollo/testing.

## Estados del Contrato

- **PENDIENTE**: Contrato creado pero aún no pagado
- **PAGADO**: Contrato pagado y activo
- **CANCELADO**: Contrato cancelado por el usuario o administrador
- **VENCIDO**: Contrato que ha expirado según su fecha de finalización

## Endpoints Implementados

### 1. Contratar Membresía

**POST** `/api/contratos/contratar`

Permite a un usuario contratar una nueva membresía.

**Body:**

```json
{
  "usuarioId": "string",
  "membresiaId": "string"
}
```

**Validaciones:**

- Verificar que el usuario existe
- Verificar que la membresía existe
- Verificar que no hay un contrato activo (pagado) vigente para la misma membresía

**Respuesta exitosa (201):**

```json
{
  "message": "Contrato creado exitosamente. Pendiente de pago.",
  "data": {
    "contrato": {...},
    "fechaInicio": "2025-09-18T...",
    "fechaFin": "2025-12-18T...",
    "precio": 5000,
    "estadoPago": "pendiente"
  }
}
```

### 2. Simular Pago

**POST** `/api/contratos/simular-pago`

Simula el procesamiento de un pago para un contrato pendiente.

**Body:**

```json
{
  "contratoId": "string"
}
```

**Funcionalidad:**

- 90% de probabilidad de éxito para simular variabilidad
- Actualiza el estado del contrato de PENDIENTE a PAGADO

**Respuesta exitosa (200):**

```json
{
  "message": "Pago procesado exitosamente",
  "data": {
    "contrato": {...},
    "metodoPago": "simulado",
    "fechaPago": "2025-09-18T...",
    "monto": 5000
  }
}
```

### 3. Cancelar Contrato

**PATCH** `/api/contratos/cancelar/:contratoId`

Permite cancelar un contrato que no esté ya cancelado o vencido.

**Respuesta exitosa (200):**

```json
{
  "message": "Contrato cancelado exitosamente",
  "data": {
    "contrato": {...},
    "fechaCancelacion": "2025-09-18T..."
  }
}
```

### 4. Verificar Vencimientos

**POST** `/api/contratos/verificar-vencimientos`

Proceso automatizable para actualizar contratos que hayan vencido.

**Funcionalidad:**

- Busca contratos con estado PAGADO cuya fecha de fin sea anterior a la fecha actual
- Los actualiza automáticamente a estado VENCIDO

**Respuesta exitosa (200):**

```json
{
  "message": "Se actualizaron 3 contratos vencidos",
  "data": {
    "contratosActualizados": 3,
    "fechaVerificacion": "2025-09-18T..."
  }
}
```

## Flujo Principal Implementado

1. **Usuario selecciona membresía**: El frontend obtiene las membresías disponibles usando `GET /api/membresias`
2. **Contratación**: El usuario envía la solicitud con `POST /api/contratos/contratar`
3. **Creación del contrato**: Se crea con estado PENDIENTE
4. **Procesamiento de pago**: Se simula el pago con `POST /api/contratos/simular-pago`
5. **Activación**: El contrato se actualiza a estado PAGADO
6. **Gestión posterior**: Se pueden cancelar o verificar vencimientos

## Flujos Alternativos Manejados

### A1. Usuario ya tiene contrato activo

- **Error 400**: "Ya existe un contrato activo para esta membresía"
- Incluye información del contrato existente y fecha de vencimiento

### A2. Datos inválidos

- **Error 400**: "Se requieren ID de usuario y membresía"

### A3. Usuario o membresía no encontrados

- **Error 404**: "Usuario no encontrado" o "Membresía no encontrada"

### A4. Fallo simulado en el pago

- **Error 400**: "Error al procesar el pago. Intente nuevamente."
- Permite reintentar el pago con el mismo contrato

### A5. Intento de cancelar contrato inválido

- **Error 400**: "El contrato ya está cancelado" o "No se puede cancelar un contrato vencido"

## Ventajas de la Implementación

### 1. Preparada para integración futura

- La estructura permite reemplazar fácilmente la simulación con un sistema de pagos real
- Los estados del contrato son estándar para sistemas de suscripción

### 2. Manejo completo del ciclo de vida

- Desde creación hasta vencimiento, pasando por todos los estados posibles
- Validaciones robustas para evitar conflictos

### 3. Facilidad de testing

- Simulador de pagos con variabilidad configurable
- Endpoints separados para cada acción permite testing granular

### 4. Escalabilidad

- Diseño preparado para múltiples tipos de membresía
- Fácil extensión para agregar funcionalidades como renovación automática

## Próximos Pasos Sugeridos

1. **Implementar autenticación**: Verificar que el usuario esté logueado antes de contratar
2. **Notificaciones**: Enviar emails de confirmación y recordatorios de vencimiento
3. **Renovación automática**: Permitir configurar renovación automática antes del vencimiento
4. **Historial de pagos**: Tabla separada para registrar todas las transacciones
5. **Sistema de descuentos**: Aplicar promociones y descuentos especiales
6. **Integración con pasarela de pagos real**: Reemplazar simulador con Stripe, PayPal, etc.

## Testing

Utilizar el archivo `contrato-contratar-plan.http` para probar todos los endpoints implementados. Asegurarse de:

1. Tener usuarios y membresías existentes en la base de datos
2. Probar todos los flujos alternativos
3. Verificar que los estados se actualizan correctamente
4. Validar que las fechas se calculan apropiadamente
