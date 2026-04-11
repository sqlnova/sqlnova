export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { consulta_usuario, consulta_correcta, enunciado, resultado_usuario, resultado_correcto } = body

    if (!consulta_usuario || !consulta_correcta || !enunciado) {
      return Response.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.replace(/\s+/g, '')
    if (!apiKey) {
      return Response.json({ error: 'Servicio de análisis no configurado' }, { status: 500 })
    }

    const fmt = (rows: any[][]) => {
      if (!rows || rows.length === 0) return '(sin resultados)'
      return rows.slice(0, 5).map((r: any[]) => r.join(' | ')).join('\n')
    }

    const prompt = [
      'Sos un entrevistador técnico senior evaluando una solución SQL.',
      '',
      'Problema: ' + String(enunciado).slice(0, 400),
      'Query candidato: ' + String(consulta_usuario).slice(0, 600),
      'Query correcto: ' + String(consulta_correcta).slice(0, 600),
      'Resultado candidato:\n' + fmt(resultado_usuario),
      'Resultado correcto:\n' + fmt(resultado_correcto),
      '',
      'Respondé SOLO con JSON válido, sin markdown:',
      '{"es_correcta": boolean, "feedback": "3-5 oraciones en español: si la lógica es correcta, si hay forma más eficiente, qué aprender"}',
    ].join('\n')

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!resp.ok) {
      const e = await resp.text()
      return Response.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 })
    }

    const data = await resp.json() as { content: { type: string; text: string }[] }
    const raw = data.content?.[0]?.text?.trim() ?? ''
    const match = raw.match(/\{[\s\S]*\}/)

    let parsed: { es_correcta: boolean; feedback: string }
    try {
      parsed = JSON.parse(match ? match[0] : raw)
    } catch {
      return Response.json({ feedback: raw || 'Sin respuesta', es_correcta: false })
    }

    return Response.json({ feedback: parsed.feedback, es_correcta: parsed.es_correcta })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
