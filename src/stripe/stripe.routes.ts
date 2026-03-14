import { Router } from 'express';
import { 
    createCheckoutSession, 
    handleWebhook,
    getSessionStatus,
    getMetodosPago,
    pagarConTransferencia,
    pagarConEfectivo
} from './stripe.controller.js';

export const StripeRouter = Router();

// Obtener métodos de pago disponibles
StripeRouter.get('/metodos-pago', getMetodosPago);

// Stripe Checkout (tarjeta de crédito/débito)
StripeRouter.post('/create-checkout-session', createCheckoutSession);

// Verificar estado de una sesión de pago
StripeRouter.get('/session/:sessionId', getSessionStatus);

// Pagos simulados (transferencia y efectivo)
StripeRouter.post('/pagar-transferencia', pagarConTransferencia);
StripeRouter.post('/pagar-efectivo', pagarConEfectivo);

// Nota: El webhook se configura directamente en app.ts con express.raw()
// para que el body no sea parseado como JSON
