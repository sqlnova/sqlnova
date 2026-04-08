import { createClient } from '@supabase/supabase-js';

// Usamos nodejs para mayor compatibilidad con fetch y auth
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

  // Inicializamos Supabase
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Leemos el body
    const body = await request.json();
    console.log('Webhook recibido:', JSON.stringify(body));

    // Mercado Pago manda el ID en data.id
    const paymentId = body?.data?.id || body?.id;
    const action = body?.action || body?.type; // A veces viene como type

    if (paymentId) {
      // Consultamos el estado del pago a Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
      });

      if (!mpResponse.ok) {
        throw new Error(`Error MP API: ${mpResponse.statusText}`);
      }

      const data = await mpResponse.json();
      console.log('Estado del pago en MP:', data.status);

      if (data.status === 'approved') {
        const userId = data.metadata?.user_id;
        console.log('ID de usuario extraído:', userId);

        if (userId) {
          const { error } = await supabaseAdmin
            .from('perfiles')
            .update({ es_premium: true })
            .eq('id', userId);

          if (error) {
            console.error('Error al actualizar Supabase:', error.message);
          } else {
            console.log(`✅ Premium activado con éxito para usuario: ${userId}`);
          }
        } else {
          console.error('No se encontró user_id en la metadata del pago');
        }
      }
    }

    // Siempre respondemos 200 para evitar reintentos infinitos
    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('Error crítico en Webhook:', error.message);
    return new Response('OK', { status: 200 });
  }
}
