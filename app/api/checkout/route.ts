import { MercadoPagoConfig, Preference } from 'mercadopago';
import { sb } from '@/lib/supabase';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'premium-lifetime',
            title: 'SQLNova Premium - Acceso de por vida',
            quantity: 1,
            unit_price: 5000, // Ajustá el precio acá
            currency_id: 'ARS',
          }
        ],
        metadata: {
          user_id: userId, // CRÍTICO: Guardamos el ID de Supabase acá
        },
        back_urls: {
          success: 'https://app.sqlnova.app/dashboard?pago=exitoso',
          failure: 'https://app.sqlnova.app/pocket?pago=error',
          pending: 'https://app.sqlnova.app/pocket?pago=pendiente',
        },
        auto_return: 'approved',
        notification_url: 'https://app.sqlnova.app/api/webhook', // Mercado Pago avisará acá
      }
    });

    return Response.json({ id: result.id });
  } catch (error) {
    return Response.json({ error: 'Error al crear la preferencia' }, { status: 500 });
  }
}
