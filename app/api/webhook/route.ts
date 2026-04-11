import { createClient } from '@supabase/supabase-js';

// Cloudflare next-on-pages EXIGE 'edge' para compilar
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Verifica la firma HMAC-SHA256 que MercadoPago incluye en cada webhook.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#bookmark_validar_origen_de_las_notificaciones
 *
 * El header x-signature tiene el formato: "ts=1704908000;v1=abc123..."
 * El manifest firmado es:               "id:[dataId];request-id:[xRequestId];ts:[ts];"
 * La clave secreta se configura en el panel de MP como "Clave secreta" del webhook
 * y debe guardarse en la variable de entorno MP_WEBHOOK_SECRET.
 */
async function verificarFirmaMP(
  secret: string,
  xSignature: string,
  xRequestId: string,
  dataId: string
): Promise<boolean> {
  const partes: Record<string, string> = {}
  for (const parte of xSignature.split(';')) {
    const [k, v] = parte.split('=')
    if (k && v) partes[k.trim()] = v.trim()
  }
  const ts = partes['ts']
  const v1 = partes['v1']
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest))
  const computedHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computedHex === v1
}

export async function POST(request: Request) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
  const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Webhook rechazado: variables de Supabase no configuradas');
    return new Response('Internal Server Error', { status: 500 });
  }
  if (!MP_ACCESS_TOKEN) {
    console.error('Webhook rechazado: MP_ACCESS_TOKEN no está configurado');
    return new Response('Internal Server Error', { status: 500 });
  }

  // Sin secret configurado no operamos: cualquier POST sería aceptado sin validar
  if (!MP_WEBHOOK_SECRET) {
    console.error('Webhook rechazado: MP_WEBHOOK_SECRET no está configurado');
    return new Response('Unauthorized', { status: 401 });
  }

  const xSignature = request.headers.get('x-signature') || '';
  const xRequestId = request.headers.get('x-request-id') || '';

  try {
    const body = await request.json();
    const paymentId = body?.data?.id || body?.id;

    if (!xSignature || !paymentId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const firmaValida = await verificarFirmaMP(
      MP_WEBHOOK_SECRET,
      xSignature,
      xRequestId,
      String(paymentId)
    );

    if (!firmaValida) {
      console.error('Webhook rechazado: firma inválida');
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (mpResponse.ok) {
      const data = await mpResponse.json();

      if (data.status === 'approved') {
        const userId = data.metadata?.user_id;

        if (userId) {
          // Deduplicación: si ya es premium no hacemos nada (webhook reintentado)
          const { data: existing } = await supabaseAdmin
            .from('perfiles')
            .select('es_premium')
            .eq('id', userId)
            .single();

          if (!existing?.es_premium) {
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
    // Respondemos 200 para que MP no reintente indefinidamente en errores de backend
    return new Response('OK', { status: 200 });
  }
}
