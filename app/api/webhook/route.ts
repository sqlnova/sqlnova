import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

// Inicializamos Supabase con la Service Role Key (necesaria para saltarse el RLS y actualizar)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');
  const type = url.searchParams.get('type');

  // Solo nos interesa si es una notificación de pago
  if (type === 'payment' && paymentId) {
    try {
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      if (data.status === 'approved') {
        const userId = data.metadata.user_id;

        // ¡MAGIA! Actualizamos al usuario en Supabase
        const { error } = await supabaseAdmin
          .from('perfiles')
          .update({ es_premium: true })
          .eq('id', userId);

        if (error) console.error('Error al actualizar premium:', error);
      }
    } catch (error) {
      console.error('Error en Webhook:', error);
    }
  }

  return new Response('OK', { status: 200 });
}
