import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response('Config Error', { status: 200 });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

    if (type === 'payment' && paymentId) {
      
      // Llamada directa a la API REST de MP (sin SDK)
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
      });

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

    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('Webhook Exception:', error.message);
    return new Response('OK', { status: 200 });
  }
}
