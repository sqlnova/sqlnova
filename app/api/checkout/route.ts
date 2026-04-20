import { PREMIUM_PRICE, PREMIUM_PLAN_NAME, APP_URL } from '@/lib/constants';

export const runtime = 'edge';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }
    if (!userId || typeof userId !== 'string' || !UUID_REGEX.test(userId)) {
      return Response.json({ error: 'userId inválido' }, { status: 400 });
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: 'premium-lifetime',
            title: PREMIUM_PLAN_NAME,
            quantity: 1,
            unit_price: PREMIUM_PRICE,
            currency_id: 'ARS',
          }
        ],
        metadata: { user_id: userId },
        back_urls: {
          success: `${APP_URL}/dashboard?pago=exitoso`,
          failure: `${APP_URL}/pocket?pago=error`,
          pending: `${APP_URL}/pocket?pago=pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${APP_URL}/api/webhook`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: 'Error MP', detail: data }, { status: 500 });
    }

    return Response.json({ url: data.init_point });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
