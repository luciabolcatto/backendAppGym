# Caso de Uso: Contratar Plan - Documentación Completa

## 📖 Descripción General

Sistema completo para la contratación de membresías por parte de los usuarios del gimnasio. Permite gestionar múltiples contratos simultáneos, renovaciones automáticas y un sistema de pagos simulado preparado para integración futura con pasarelas de pago reales.

## ✨ Características Principales

- **Múltiples contratos simultáneos**: Los usuarios pueden tener varios contratos activos
- **Renovaciones secuenciales**: Los nuevos contratos se programan automáticamente al finalizar los anteriores
- **Trazabilidad completa**: Registro de fechas de pago, cancelación y métodos utilizados
- **Sistema de pagos simulado**: Preparado para integración con sistemas reales
- **Gestión de estados avanzada**: Control completo del ciclo de vida de los contratos

## 🎯 Actores

- **Usuario**: Cliente que desea contratar una membresía
- **Sistema**: Backend que gestiona la lógica de contratación y pagos
- **Administrador**: Encargado de gestionar y monitorear contratos

## 📋 Estados del Contrato

| Estado        | Descripción                          | Campos Completados                 |
| ------------- | ------------------------------------ | ---------------------------------- |
| **PENDIENTE** | Contrato creado pero aún no pagado   | `fecha_hora_ini`, `fecha_hora_fin` |
| **PAGADO**    | Contrato pagado y activo             | + `fechaPago`, `metodoPago`        |
| **CANCELADO** | Contrato cancelado por usuario/admin | + `fechaCancelacion`               |
| **VENCIDO**   | Contrato expirado automáticamente    | (sin campos adicionales)           |

## 🔄 Flujo Principal del Caso de Uso

### Escenario 1: Primera Contratación

1. Usuario selecciona una membresía disponible
2. Sistema valida usuario y membresía
3. Sistema crea contrato con estado PENDIENTE
4. Usuario procesa el pago
5. Sistema actualiza contrato a PAGADO con fecha y método de pago
6. Usuario puede utilizar los servicios del gimnasio

### Escenario 2: Renovación/Extensión

1. Usuario con contrato vigente quiere renovar
2. Sistema detecta contrato activo existente
3. Sistema programa nuevo contrato para iniciar al finalizar el actual
4. Usuario procesa el pago anticipado
5. Sistema mantiene ambos contratos (actual + futuro)
6. Al vencer el primer contrato, el segundo se activa automáticamente

## 🎯 Endpoints Implementados

### 1. Contratar Membresía

**POST** `/api/contratos/contratar`

**Funcionalidad:**

- ✅ Primera contratación: Inicia inmediatamente
- ✅ Renovación: Programa inicio al finalizar contrato vigente
- ✅ Reactivación: Si contrato anterior venció, inicia inmediatamente
- ✅ Múltiples membresías: Permite diferentes tipos simultáneamente

**Request:**

```json
{
  "usuarioId": "string",
  "membresiaId": "string"
}
```

**Response (201):**

```json
{
  "message": "Renovación programada exitosamente. Pendiente de pago.",
  "data": {
    "contrato": {
      "id": "contract_id",
      "estado": "pendiente",
      "fecha_hora_ini": "2025-12-18T00:00:00Z",
      "fecha_hora_fin": "2026-03-18T00:00:00Z"
    },
    "fechaInicio": "2025-12-18T00:00:00Z",
    "fechaFin": "2026-03-18T00:00:00Z",
    "precio": 5000,
    "estadoPago": "pendiente",
    "esRenovacion": true,
    "contratoAnterior": {
      "id": "previous_contract_id",
      "fechaFin": "2025-12-18T00:00:00Z"
    }
  }
}
```

### 2. Simular Pago

**POST** `/api/contratos/simular-pago`

**Funcionalidad:**

- ✅ Procesa pago con 90% probabilidad de éxito
- ✅ Registra fecha y método de pago automáticamente
- ✅ Actualiza estado a PAGADO

**Request:**

```json
{
  "contratoId": "string",
  "metodoPago": "tarjeta_credito" // Opcional, default: "simulado"
}
```

**Response (200):**

```json
{
  "message": "Pago procesado exitosamente",
  "data": {
    "contrato": {...},
    "metodoPago": "tarjeta_credito",
    "fechaPago": "2025-09-18T14:30:00Z",
    "monto": 5000,
    "vigenciaDesde": "2025-12-18T00:00:00Z",
    "vigenciaHasta": "2026-03-18T00:00:00Z"
  }
}
```

### 3. Cancelar Contrato

**PATCH** `/api/contratos/cancelar/:contratoId`

**Funcionalidad:**

- ✅ Cancela contratos pendientes o pagados
- ✅ Registra fecha de cancelación
- ✅ Impide cancelar contratos ya vencidos

**Response (200):**

```json
{
  "message": "Contrato cancelado exitosamente",
  "data": {
    "contrato": {...},
    "fechaCancelacion": "2025-09-18T14:30:00Z",
    "estadoAnterior": "pagado"
  }
}
```

### 4. Obtener Contratos de Usuario

**GET** `/api/contratos/usuario/:usuarioId`

**Funcionalidad:**

- ✅ Vista completa de todos los contratos del usuario
- ✅ Organización por estado y vigencia
- ✅ Resumen estadístico

**Response (200):**

```json
{
  "message": "Contratos del usuario obtenidos exitosamente",
  "data": {
    "usuario": {
      "id": "user_id",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "resumen": {
      "totalContratos": 5,
      "contratosActivos": 1,      // Vigentes ahora
      "proximosContratos": 2,     // Inician en futuro
      "contratosPendientes": 1    // Sin pagar
    },
    "contratos": {
      "activos": [...],      // Pagados y vigentes actualmente
      "proximos": [...],     // Pagados, inician en futuro
      "pendientes": [...],   // Esperando pago
      "cancelados": [...],   // Cancelados
      "vencidos": [...]      // Expirados
    }
  }
}
```

### 5. Verificar Vencimientos

**POST** `/api/contratos/verificar-vencimientos`

**Funcionalidad:**

- ✅ Proceso automático para actualizar contratos vencidos
- ✅ Busca contratos PAGADOS con fecha de fin pasada
- ✅ Los actualiza masivamente a VENCIDO

### 6. Estadísticas del Sistema

**GET** `/api/contratos/admin/estadisticas`

**Funcionalidad:**

- ✅ Vista global del estado de todos los contratos
- ✅ Métricas para administradores

## 🔍 Flujos Alternativos

### A1. Usuario ya tiene contrato vigente

**Resultado:** Se programa renovación secuencial

- El nuevo contrato inicia cuando termine el actual
- Ambos contratos coexisten (actual + futuro)
- Sin interrupciones en el servicio

### A2. Usuario intenta renovar contrato vencido

**Resultado:** Se crea contrato inmediato

- Nuevo contrato inicia inmediatamente
- No se considera renovación sino nueva contratación

### A3. Fallo en el procesamiento de pago

**Resultado:** Error con posibilidad de reintento

- Contrato permanece en estado PENDIENTE
- Usuario puede intentar pago nuevamente
- 10% probabilidad de fallo en simulación

### A4. Cancelación de contrato futuro

**Resultado:** Cancelación sin afectar contrato actual

- Se cancela solo el contrato seleccionado
- Contratos vigentes no se ven afectados
- Ideal para cambios de planes

## 🛠️ Implementación Técnica

### Entidad Contrato

```typescript
export class Contrato extends BaseEntity {
  fecha_hora_ini: Date; // Fecha inicio vigencia
  fecha_hora_fin: Date; // Fecha fin vigencia
  estado: EstadoContrato; // Estado actual
  fechaPago?: Date; // Cuándo se completó el pago
  fechaCancelacion?: Date; // Cuándo se canceló
  metodoPago?: string; // Método utilizado para pagar
  usuario: Usuario; // Usuario propietario
  membresia: Membresia; // Tipo de membresía
}
```

### Validaciones Implementadas

- ✅ Existencia de usuario y membresía
- ✅ Estados válidos para cada operación
- ✅ Fechas coherentes y secuenciales
- ✅ Prevención de cancelación de contratos vencidos
- ✅ Gestión de errores con mensajes descriptivos

## 🧪 Testing y Validación

### Casos de Prueba Incluidos

1. **Contratación inicial**: Usuario sin contratos previos
2. **Renovación anticipada**: Usuario con contrato vigente
3. **Múltiples membresías**: Diferentes tipos simultáneamente
4. **Pagos variados**: Diferentes métodos de pago
5. **Cancelaciones**: En diferentes estados
6. **Fallas de pago**: Manejo de errores
7. **Vencimientos**: Actualización automática

### Archivo de Testing

`src/contrato/contrato-contratar-plan.http` incluye:

- Flujos completos paso a paso
- Casos de error y validaciones
- Ejemplos con IDs reales del sistema
- Secuencias de múltiples contratos

## 🚀 Beneficios del Sistema

### Para el Usuario

- **Sin interrupciones**: Renovaciones anticipadas
- **Flexibilidad**: Múltiples planes simultáneos
- **Transparencia**: Historial completo de pagos
- **Control**: Cancelaciones granulares

### Para el Gimnasio

- **Ingresos predecibles**: Renovaciones anticipadas
- **Gestión simplificada**: Vista unificada de contratos
- **Escalabilidad**: Soporta crecimiento del negocio
- **Trazabilidad**: Auditoría completa de transacciones

### Para el Desarrollo

- **Preparado para producción**: Estructura robusta
- **Fácil integración**: Con pasarelas de pago reales
- **Mantenible**: Código bien documentado y testeado
- **Extensible**: Preparado para nuevas funcionalidades

## 🔮 Próximos Pasos Sugeridos

1. **Notificaciones**

   - Emails de confirmación de contratación
   - Recordatorios de vencimiento próximo
   - Alertas de pagos fallidos

2. **Renovación Automática**

   - Opción de auto-renovación
   - Cargo automático antes del vencimiento
   - Configuración por usuario

3. **Sistema de Descuentos**

   - Descuentos por lealtad
   - Promociones especiales
   - Códigos de descuento

4. **Integración de Pagos Real**

   - Stripe, PayPal, MercadoPago
   - Múltiples métodos de pago
   - Gestión de reembolsos

5. **Reportes Avanzados**
   - Análisis de ingresos
   - Métricas de retención
   - Predicción de renovaciones

## ⚡ Configuración y Uso

### Prerequisitos

- Node.js y TypeScript configurados
- Base de datos con usuarios y membresías existentes
- Servidor corriendo en puerto 5500

### Testing Rápido

1. Obtener IDs de usuarios y membresías
2. Usar archivo `.http` para probar endpoints
3. Verificar estados en base de datos
4. Probar flujos completos de renovación

Este sistema está diseñado para ser robusto, escalable y fácil de mantener, proporcionando una base sólida para el crecimiento futuro del negocio del gimnasio.
