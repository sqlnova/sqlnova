import { PREMIUM_PRICE, PREMIUM_PLAN_NAME } from '@/lib/constants';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }
    if (!userId) {
      return Response.json({ error: 'userId requerido' }, { status: 400 });
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
          success: 'https://app.sqlnova.app/dashboard?pago=exitoso',
          failure: 'https://app.sqlnova.app/pocket?pago=error',
          pending: 'https://app.sqlnova.app/pocket?pago=pendiente',
        },
        auto_return: 'approved',
        notification_url: 'https://app.sqlnova.app/api/webhook',
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
