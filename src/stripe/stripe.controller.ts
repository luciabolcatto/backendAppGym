import { Request, Response } from 'express';
import Stripe from 'stripe';
import { orm } from '../shared/db/orm.js';
import { Contrato, EstadoContrato } from '../contrato/contrato.entity.js';

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover'
});

const em = orm.em;

/**
 * Métodos de pago disponibles en el sistema.
 */
const METODOS_PAGO = {
    STRIPE: 'stripe',
    TRANSFERENCIA: 'transferencia_bancaria',
    EFECTIVO: 'efectivo'
} as const;

/**
 * Crea una sesión de Stripe Checkout para pagar un contrato pendiente.
 * 
 * @param req - Request con contratoId en el body
 * @param res - Response con la URL de checkout o error
 */
async function createCheckoutSession(req: Request, res: Response) {
    try {
        const { contratoId } = req.body;

        if (!contratoId) {
            return res.status(400).json({ 
                message: 'Se requiere el ID del contrato' 
            });
        }

        // Buscar el contrato con sus relaciones
        const contrato = await em.findOne(Contrato, { id: contratoId }, { 
            populate: ['usuario', 'membresia'] 
        });

        if (!contrato) {
            return res.status(404).json({ 
                message: 'Contrato no encontrado' 
            });
        }

        // Validar que el contrato esté en estado pendiente
        if (contrato.estado !== EstadoContrato.PENDIENTE) {
            return res.status(400).json({ 
                message: `El contrato no está pendiente de pago. Estado actual: ${contrato.estado}` 
            });
        }

        // Validar que no tenga ya una sesión de Stripe activa
        if (contrato.stripeSessionId) {
            // Verificar si la sesión anterior sigue activa
            try {
                const existingSession = await stripe.checkout.sessions.retrieve(contrato.stripeSessionId);
                if (existingSession.status === 'open') {
                    return res.status(200).json({
                        message: 'Ya existe una sesión de pago activa',
                        checkoutUrl: existingSession.url
                    });
                }
            } catch {
                // La sesión anterior expiró o no existe, continuamos creando una nueva
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Si se usa clave de prueba de Stripe, mantenemos USD para evitar restricciones
        // de algunas cuentas/regiones con monedas locales en modo test.
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
        const isTestMode = stripeSecretKey.startsWith('sk_test_');
        const currency = isTestMode ? 'usd' : 'ars';

        // Stripe usa la unidad mínima de la moneda (centavos).
        // En test convertimos el precio de demo a USD para mantener montos razonables.
        const unitAmount = isTestMode
            ? Math.round((contrato.membresia.precio / 1000) * 100)
            : Math.round(contrato.membresia.precio * 100);

        // Crear la sesión de Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: contrato.membresia.nombre,
                            description: `${contrato.membresia.descripcion} - Duración: ${contrato.membresia.meses} mes(es)`,
                        },
                        // Stripe usa centavos
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                contratoId: contrato.id!,
                usuarioId: contrato.usuario.id!,
                membresiaId: contrato.membresia.id!,
            },
            customer_email: contrato.usuario.mail,
            success_url: `${frontendUrl}/mis-contratos?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/mis-contratos?payment=cancelled`,
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expira en 30 minutos
        });

        // Guardar el ID de la sesión en el contrato
        contrato.stripeSessionId = session.id;
        await em.flush();

        res.status(200).json({
            message: 'Sesión de pago creada exitosamente',
            checkoutUrl: session.url,
            sessionId: session.id
        });

    } catch (error: any) {
        console.error('Error al crear sesión de checkout:', error);
        res.status(500).json({ 
            message: 'Error al crear la sesión de pago',
            error: error.message 
        });
    }
}

/**
 * Maneja los webhooks de Stripe para procesar eventos de pago.
 * 
 * @param req - Request con el evento de Stripe en el body (raw)
 * @param res - Response para confirmar recepción del webhook
 */
async function handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET no está configurado');
        return res.status(500).json({ 
            message: 'Webhook secret no configurado' 
        });
    }

    let event: Stripe.Event;

    try {
        // Verificar la firma del webhook
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error('Error verificando webhook:', err.message);
        return res.status(400).json({ 
            message: `Webhook Error: ${err.message}` 
        });
    }

    // Procesar el evento según su tipo
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutSessionCompleted(session);
            break;
        }
        case 'checkout.session.expired': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutSessionExpired(session);
            break;
        }
        default:
            console.log(`Evento no manejado: ${event.type}`);
    }

    // Responder a Stripe que el webhook fue recibido
    res.status(200).json({ received: true });
}

/**
 * Procesa el evento cuando una sesión de checkout se completa exitosamente.
 * Actualiza el contrato a estado PAGADO.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
        const contratoId = session.metadata?.contratoId;

        if (!contratoId) {
            console.error('No se encontró contratoId en los metadata de la sesión');
            return;
        }

        // Buscar el contrato
        const contrato = await em.findOne(Contrato, { id: contratoId }, {
            populate: ['usuario', 'membresia']
        });

        if (!contrato) {
            console.error(`Contrato no encontrado: ${contratoId}`);
            return;
        }

        // Actualizar el contrato a pagado
        contrato.estado = EstadoContrato.PAGADO;
        contrato.fechaPago = new Date();
        contrato.metodoPago = METODOS_PAGO.STRIPE;

        await em.flush();

        console.log(`✅ Contrato ${contratoId} actualizado a PAGADO`);
        console.log(`   Usuario: ${contrato.usuario.nombre} ${contrato.usuario.apellido}`);
        console.log(`   Membresía: ${contrato.membresia.nombre}`);
        console.log(`   Monto: $${contrato.membresia.precio} ARS`);

    } catch (error: any) {
        console.error('Error procesando checkout.session.completed:', error.message);
    }
}

/**
 * Procesa el evento cuando una sesión de checkout expira.
 * Limpia el stripeSessionId del contrato para permitir crear una nueva sesión.
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
    try {
        const contratoId = session.metadata?.contratoId;

        if (!contratoId) {
            return;
        }

        // Buscar el contrato
        const contrato = await em.findOne(Contrato, { id: contratoId });

        if (!contrato) {
            return;
        }

        // Solo limpiar si el contrato sigue pendiente
        if (contrato.estado === EstadoContrato.PENDIENTE) {
            contrato.stripeSessionId = undefined;
            await em.flush();
            console.log(`⏰ Sesión expirada para contrato ${contratoId}, sessionId limpiado`);
        }

    } catch (error: any) {
        console.error('Error procesando checkout.session.expired:', error.message);
    }
}

/**
 * Verifica el estado de una sesión de Stripe Checkout.
 * Útil para que el frontend confirme el estado del pago.
 */
async function getSessionStatus(req: Request, res: Response) {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ 
                message: 'Se requiere el ID de la sesión' 
            });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Buscar el contrato asociado
        const contratoId = session.metadata?.contratoId;
        let contrato = null;

        if (contratoId) {
            contrato = await em.findOne(Contrato, { id: contratoId }, {
                populate: ['membresia']
            });
        }

        res.status(200).json({
            sessionId: session.id,
            status: session.status,
            paymentStatus: session.payment_status,
            contrato: contrato ? {
                id: contrato.id,
                estado: contrato.estado,
                membresia: contrato.membresia.nombre
            } : null
        });

    } catch (error: any) {
        console.error('Error al obtener estado de sesión:', error);
        res.status(500).json({ 
            message: 'Error al verificar el estado de la sesión',
            error: error.message 
        });
    }
}

/**
 * Obtiene los métodos de pago disponibles.
 */
async function getMetodosPago(_req: Request, res: Response) {
    res.status(200).json({
        message: 'Métodos de pago disponibles',
        data: [
            {
                id: METODOS_PAGO.STRIPE,
                nombre: 'Tarjeta de Crédito/Débito',
                descripcion: 'Pago seguro con tarjeta a través de Stripe',
                icono: 'credit-card',
                requiereRedireccion: true
            },
            {
                id: METODOS_PAGO.TRANSFERENCIA,
                nombre: 'Transferencia Bancaria',
                descripcion: 'Transferencia a cuenta bancaria del gimnasio',
                icono: 'bank',
                requiereRedireccion: false,
                datosBancarios: {
                    banco: 'Banco Ejemplo',
                    titular: 'Gimnasio AppGym S.A.',
                    cbu: '0000000000000000000000',
                    alias: 'GIMNASIO.APPGYM'
                }
            },
            {
                id: METODOS_PAGO.EFECTIVO,
                nombre: 'Efectivo',
                descripcion: 'Pago en efectivo en recepción del gimnasio',
                icono: 'cash',
                requiereRedireccion: false,
                instrucciones: 'Acércate a la recepción del gimnasio con tu número de contrato para realizar el pago.'
            }
        ]
    });
}

/**
 * Procesa un pago con transferencia bancaria (simulado).
 * En un sistema real, esto quedaría pendiente de verificación manual.
 * Para esta demo, se marca como pagado inmediatamente.
 */
async function pagarConTransferencia(req: Request, res: Response) {
    try {
        const { contratoId, comprobanteNumero } = req.body;

        if (!contratoId) {
            return res.status(400).json({ 
                message: 'Se requiere el ID del contrato' 
            });
        }

        // Buscar el contrato
        const contrato = await em.findOne(Contrato, { id: contratoId }, { 
            populate: ['usuario', 'membresia'] 
        });

        if (!contrato) {
            return res.status(404).json({ 
                message: 'Contrato no encontrado' 
            });
        }

        // Validar que el contrato esté en estado pendiente
        if (contrato.estado !== EstadoContrato.PENDIENTE) {
            return res.status(400).json({ 
                message: `El contrato no está pendiente de pago. Estado actual: ${contrato.estado}` 
            });
        }

        // Simular procesamiento de transferencia (en producción esto requeriría verificación manual)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Actualizar el contrato a pagado
        contrato.estado = EstadoContrato.PAGADO;
        contrato.fechaPago = new Date();
        contrato.metodoPago = METODOS_PAGO.TRANSFERENCIA;

        await em.flush();

        console.log(`✅ Contrato ${contratoId} pagado con TRANSFERENCIA BANCARIA`);
        console.log(`   Usuario: ${contrato.usuario.nombre} ${contrato.usuario.apellido}`);
        console.log(`   Membresía: ${contrato.membresia.nombre}`);
        console.log(`   Comprobante: ${comprobanteNumero || 'No proporcionado'}`);

        res.status(200).json({
            message: 'Pago con transferencia procesado exitosamente',
            data: {
                contrato: {
                    id: contrato.id,
                    estado: contrato.estado,
                    fechaPago: contrato.fechaPago,
                    metodoPago: contrato.metodoPago
                },
                membresia: contrato.membresia.nombre,
                monto: contrato.membresia.precio,
                comprobante: comprobanteNumero || null
            }
        });

    } catch (error: any) {
        console.error('Error al procesar pago con transferencia:', error);
        res.status(500).json({ 
            message: 'Error al procesar el pago',
            error: error.message 
        });
    }
}

/**
 * Procesa un pago en efectivo (simulado).
 * En un sistema real, esto lo registraría un empleado en recepción.
 * Para esta demo, se marca como pagado inmediatamente.
 */
async function pagarConEfectivo(req: Request, res: Response) {
    try {
        const { contratoId } = req.body;

        if (!contratoId) {
            return res.status(400).json({ 
                message: 'Se requiere el ID del contrato' 
            });
        }

        // Buscar el contrato
        const contrato = await em.findOne(Contrato, { id: contratoId }, { 
            populate: ['usuario', 'membresia'] 
        });

        if (!contrato) {
            return res.status(404).json({ 
                message: 'Contrato no encontrado' 
            });
        }

        // Validar que el contrato esté en estado pendiente
        if (contrato.estado !== EstadoContrato.PENDIENTE) {
            return res.status(400).json({ 
                message: `El contrato no está pendiente de pago. Estado actual: ${contrato.estado}` 
            });
        }

        // Simular procesamiento de pago en efectivo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar el contrato a pagado
        contrato.estado = EstadoContrato.PAGADO;
        contrato.fechaPago = new Date();
        contrato.metodoPago = METODOS_PAGO.EFECTIVO;

        await em.flush();

        console.log(`✅ Contrato ${contratoId} pagado en EFECTIVO`);
        console.log(`   Usuario: ${contrato.usuario.nombre} ${contrato.usuario.apellido}`);
        console.log(`   Membresía: ${contrato.membresia.nombre}`);
        console.log(`   Monto: $${contrato.membresia.precio} ARS`);

        res.status(200).json({
            message: 'Pago en efectivo registrado exitosamente',
            data: {
                contrato: {
                    id: contrato.id,
                    estado: contrato.estado,
                    fechaPago: contrato.fechaPago,
                    metodoPago: contrato.metodoPago
                },
                membresia: contrato.membresia.nombre,
                monto: contrato.membresia.precio,
                reciboNumero: `EF-${Date.now()}`
            }
        });

    } catch (error: any) {
        console.error('Error al procesar pago en efectivo:', error);
        res.status(500).json({ 
            message: 'Error al procesar el pago',
            error: error.message 
        });
    }
}

export {
    createCheckoutSession,
    handleWebhook,
    getSessionStatus,
    getMetodosPago,
    pagarConTransferencia,
    pagarConEfectivo
};
