import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// OBLIGATORIO para Cloudflare Pages
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response('Config Error', { status: 200 });
  }

  const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

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
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Webhook Exception:', error.message);
    // Respondemos 200 siempre para que MP no reintente infinitamente en caso de error de código
    return new Response('OK', { status: 200 });
  }
}
