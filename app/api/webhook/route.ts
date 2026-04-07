import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// ESTA LÍNEA ES LA CLAVE: Fuerza a que sea dinámica y no falle en el build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Inicializamos las variables ADENTRO de la función para que no se lean al compilar
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // Si faltan datos críticos, cortamos acá pero respondemos 200 para no trabar el build
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Faltan variables de entorno de Supabase');
    return new Response('Config Error', { status: 200 });
  }

  const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (type === 'payment' && paymentId) {
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      if (data.status === 'approved') {
        const userId = data.metadata?.user_id;

        if (userId) {
          const { error } = await supabaseAdmin
            .from('perfiles')
            .update({ es_premium: true })
            .eq('id', userId);

          if (error) console.error('Error Supabase:', error.message);
          else console.log(`Premium activado para: ${userId}`);
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Webhook Exception:', error.message);
    return new Response('OK', { status: 200 });
  }
}
