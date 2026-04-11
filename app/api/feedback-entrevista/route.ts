export const runtime = 'edge'

export async function POST(_request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY?.replace(/\s+/g, '')
    if (!apiKey) {
      return Response.json({ error: 'sin key' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Responde solo: hola' }],
      }),
    })

    const body = await response.text()
    return Response.json({ status: response.status, body: body.slice(0, 400) })
  } catch (error: any) {
    return Response.json({ error: error.message, type: error.constructor?.name }, { status: 500 })
  }
}
