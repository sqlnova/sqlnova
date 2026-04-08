import { createClient } from '@supabase/supabase-js';

// Cloudflare next-on-pages EXIGE 'edge' para compilar
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // En Edge usamos el estándar de Request
    const body = await request.json();
    
    // Obtenemos el ID del pago
    const paymentId = body?.data?.id || body?.id;

    if (paymentId) {
      // Fetch estándar compatible con Edge Runtime
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
      });

      if (mpResponse.ok) {
        const data = await mpResponse.json();

        if (data.status === 'approved') {
          const userId = data.metadata?.user_id;

          if (userId) {
            const { error } = await supabaseAdmin
              .from('perfiles')
              .update({ es_premium: true })
              .eq('id', userId);

            if (error) console.error('Error Supabase:', error.message);
          }
        }
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    // Respondemos 200 para que MP no se quede loopeando
    return new Response('OK', { status: 200 });
  }
}
