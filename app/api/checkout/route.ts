import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PREMIUM_PRICE, PREMIUM_PLAN_NAME } from '@/lib/constants';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'premium-lifetime',
            title: PREMIUM_PLAN_NAME,
            quantity: 1,
            unit_price: PREMIUM_PRICE,
            currency_id: 'ARS',
          }
        ],
        metadata: {
          user_id: userId, // Esto es lo que lee el webhook para activar la cuenta
        },
        back_urls: {
          success: 'https://app.sqlnova.app/dashboard?pago=exitoso',
          failure: 'https://app.sqlnova.app/pocket?pago=error',
          pending: 'https://app.sqlnova.app/pocket?pago=pendiente',
        },
        auto_return: 'approved',
        notification_url: 'https://app.sqlnova.app/api/webhook',
      }
    });

    return Response.json({ id: result.id });
  } catch (error) {
    console.error('Error MP:', error);
    return Response.json({ error: 'Error al crear la preferencia' }, { status: 500 });
  }
}
