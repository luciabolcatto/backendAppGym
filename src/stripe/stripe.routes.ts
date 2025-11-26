import { Router } from 'express';
import { 
    createCheckoutSession, 
    handleWebhook,
    getSessionStatus 
} from './stripe.controller.js';

export const StripeRouter = Router();

// Crear sesión de checkout para pagar un contrato
StripeRouter.post('/create-checkout-session', createCheckoutSession);

// Verificar estado de una sesión de pago
StripeRouter.get('/session/:sessionId', getSessionStatus);

// Nota: El webhook se configura directamente en app.ts con express.raw()
// para que el body no sea parseado como JSON
