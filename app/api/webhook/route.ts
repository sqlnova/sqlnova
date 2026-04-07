import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Fuerza a Next.js a usar el runtime de Node si hay problemas con Edge
export const runtime = 'nodejs'; 

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    // Mercado Pago envía el ID de diferentes formas según el evento
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (type === 'payment' && paymentId) {
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      // IMPORTANTE: Verificar que el pago esté aprobado
      if (data.status === 'approved') {
        const userId = data.metadata.user_id;

        if (!userId) {
          console.error('Webhook Error: No se encontró user_id en la metadata');
          return new Response('No user_id', { status: 400 });
        }

        // Actualización en Supabase
        const { error } = await supabaseAdmin
          .from('perfiles')
          .update({ es_premium: true })
          .eq('id', userId);

        if (error) {
          console.error('Error Supabase:', error.message);
          return new Response('Error DB', { status: 500 });
        }
        
        console.log(`Premium activado para el usuario: ${userId}`);
      }
    }

    // Siempre respondemos 200 a Mercado Pago para que no reintente infinitamente
    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('Webhook Exception:', error.message);
    // Respondemos 200 igual para evitar bucles de reintento de MP si el error es de lógica
    return new Response('Error Interno', { status: 200 });
  }
}
