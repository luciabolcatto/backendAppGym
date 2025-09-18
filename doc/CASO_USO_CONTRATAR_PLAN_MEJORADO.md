# Caso de Uso Contratar Plan - VERSIÓN MEJORADA

## 🚀 Nuevas Funcionalidades Implementadas

### ✨ Campos Adicionales en Contrato

- **fechaPago**: Se registra automáticamente cuando se completa el pago
- **fechaCancelacion**: Se registra cuando se cancela un contrato
- **metodoPago**: Almacena el método de pago utilizado (tarjeta, efectivo, etc.)

### 🔄 Gestión de Múltiples Contratos

- Los usuarios ahora pueden tener **múltiples contratos pagados** simultáneamente
- Los contratos de renovación se **secuencian automáticamente**
- El nuevo contrato inicia cuando termina el anterior

## 📋 Estados del Contrato

- **PENDIENTE**: Contrato creado pero aún no pagado
- **PAGADO**: Contrato pagado y activo (con fechaPago y metodoPago registrados)
- **CANCELADO**: Contrato cancelado (con fechaCancelacion registrada)
- **VENCIDO**: Contrato que ha expirado según su fecha de finalización

## 🎯 Endpoints Implementados

### 1. Contratar Membresía (Mejorado)

**POST** `/api/contratos/contratar`

**Funcionalidad mejorada:**

- ✅ Permite contratar la misma membresía múltiples veces
- ✅ Si tiene contrato vigente: programa el nuevo para cuando termine el actual
- ✅ Si el contrato anterior venció: inicia inmediatamente
- ✅ Detecta si es primera contratación o renovación

**Body:**

```json
{
  "usuarioId": "string",
  "membresiaId": "string"
}
```

**Respuesta exitosa (201):**

```json
{
  "message": "Renovación programada exitosamente. Pendiente de pago.",
  "data": {
    "contrato": {...},
    "fechaInicio": "2025-12-18T...",  // Fecha fin del contrato anterior
    "fechaFin": "2026-03-18T...",
    "precio": 5000,
    "estadoPago": "pendiente",
    "esRenovacion": true,
    "contratoAnterior": {
      "id": "anterior_id",
      "fechaFin": "2025-12-18T..."
    }
  }
}
```

### 2. Simular Pago (Mejorado)

**POST** `/api/contratos/simular-pago`

**Funcionalidad mejorada:**

- ✅ Registra fecha de pago automáticamente
- ✅ Permite especificar método de pago
- ✅ Actualiza todos los campos relacionados al pago

**Body:**

```json
{
  "contratoId": "string",
  "metodoPago": "tarjeta_credito" // Opcional, default: "simulado"
}
```

**Respuesta exitosa (200):**

```json
{
  "message": "Pago procesado exitosamente",
  "data": {
    "contrato": {...},
    "metodoPago": "tarjeta_credito",
    "fechaPago": "2025-09-18T...",
    "monto": 5000,
    "vigenciaDesde": "2025-12-18T...",
    "vigenciaHasta": "2026-03-18T..."
  }
}
```

### 3. Cancelar Contrato (Mejorado)

**PATCH** `/api/contratos/cancelar/:contratoId`

**Funcionalidad mejorada:**

- ✅ Registra fecha de cancelación automáticamente
- ✅ Indica el estado anterior del contrato
- ✅ Validaciones robustas

**Respuesta exitosa (200):**

```json
{
  "message": "Contrato cancelado exitosamente",
  "data": {
    "contrato": {...},
    "fechaCancelacion": "2025-09-18T...",
    "estadoAnterior": "pagado"
  }
}
```

### 4. Obtener Contratos de Usuario (NUEVO)

**GET** `/api/contratos/usuario/:usuarioId`

Obtiene todos los contratos de un usuario organizados por estado y tipo.

**Respuesta exitosa (200):**

```json
{
  "message": "Contratos del usuario obtenidos exitosamente",
  "data": {
    "usuario": {
      "id": "...",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "resumen": {
      "totalContratos": 5,
      "contratosActivos": 1,
      "proximosContratos": 2,
      "contratosPendientes": 1
    },
    "contratos": {
      "activos": [...],      // Pagados y vigentes actualmente
      "proximos": [...],     // Pagados pero inician en el futuro
      "pendientes": [...],   // Esperando pago
      "cancelados": [...],   // Cancelados
      "vencidos": [...]      // Expirados
    }
  }
}
```

### 5. Estadísticas de Contratos (NUEVO)

**GET** `/api/contratos/admin/estadisticas`

Obtiene estadísticas generales del sistema de contratos.

**Respuesta exitosa (200):**

```json
{
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "totalContratos": 150,
    "pendientes": 12,
    "pagados": 98,
    "cancelados": 25,
    "vencidos": 15,
    "activos": 67, // Pagados y vigentes actualmente
    "fechaConsulta": "2025-09-18T..."
  }
}
```

## 🔄 Flujo de Múltiples Contratos

### Escenario: Usuario quiere renovar su membresía

1. **Usuario tiene contrato vigente** (Pagado, vence 18/12/2025)
2. **Contrata la misma membresía** → Sistema programa nuevo contrato desde 18/12/2025
3. **Paga el nuevo contrato** → Queda con 2 contratos pagados:
   - Contrato actual: vigente hasta 18/12/2025
   - Contrato futuro: vigente desde 18/12/2025 hasta 18/03/2026

### Ventajas del Sistema:

- ✅ Sin interrupciones en el servicio
- ✅ Planificación anticipada de renovaciones
- ✅ Historial completo de pagos
- ✅ Flexibilidad para cancelar contratos futuros

## 📊 Casos de Uso Soportados

### ✅ Renovación Anticipada

```bash
# Usuario con contrato vigente hasta diciembre
POST /contratar → Crea contrato desde diciembre hasta marzo
POST /simular-pago → Activa el contrato futuro
```

### ✅ Reactivación Después de Vencimiento

```bash
# Usuario con contrato vencido hace 2 meses
POST /contratar → Crea contrato inmediato
POST /simular-pago → Activa inmediatamente
```

### ✅ Múltiples Membresías

```bash
# Usuario puede tener contratos de diferentes membresías
POST /contratar (Membresía A) → OK
POST /contratar (Membresía B) → OK (diferentes productos)
```

### ✅ Gestión de Cancelaciones

```bash
# Cancelar contrato pendiente
PATCH /cancelar → Registra cancelación sin afectar otros contratos

# Cancelar contrato futuro
PATCH /cancelar → Evita activación futura, mantiene contrato actual
```

## 🛠️ Testing Completo

El archivo `contrato-contratar-plan.http` incluye:

1. **Flujo básico**: Contratar → Pagar
2. **Flujo de renovación**: Contratar mientras hay contrato vigente
3. **Gestión múltiple**: Ver todos los contratos de un usuario
4. **Casos edge**: Pagos fallidos, cancelaciones, estadísticas
5. **Validaciones**: Intentar cancelar contratos vencidos

## 🚀 Preparado Para el Futuro

### Integración de Pagos Reales

El campo `metodoPago` está preparado para valores como:

- `"stripe"`
- `"mercado_pago"`
- `"paypal"`
- `"tarjeta_credito"`
- `"transferencia"`

### Extensiones Posibles

- **Notificaciones**: Alertas de vencimiento usando `fechaPago`
- **Reportes**: Análisis de ingresos usando `metodoPago`
- **Renovación automática**: Basada en contratos futuros ya programados
- **Descuentos**: Por lealtad basados en historial de contratos

## 📈 Beneficios de la Nueva Implementación

1. **Experiencia de usuario mejorada**: Sin interrupciones en el servicio
2. **Gestión administrativa**: Vista completa de todos los contratos
3. **Escalabilidad**: Soporta cualquier cantidad de contratos simultáneos
4. **Trazabilidad**: Registro completo de fechas y métodos de pago
5. **Flexibilidad**: Cancelaciones granulares sin afectar otros contratos
6. **Preparado para producción**: Estructura robusta para sistema de pagos real
