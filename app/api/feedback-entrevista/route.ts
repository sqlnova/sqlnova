export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (body?.debug === true) {
      return Response.json({ ok: true, msg: 'ruta activa, sin llamar a Anthropic' })
    }
  } catch {
    // ignore parse errors for debug path
  }
  return Response.json({ feedback: 'debug', es_correcta: true })
}
