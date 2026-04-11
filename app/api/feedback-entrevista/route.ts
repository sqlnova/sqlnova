export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { consulta_usuario, consulta_correcta, enunciado, resultado_usuario, resultado_correcto } = body

    if (!consulta_usuario || !consulta_correcta || !enunciado) {
      return Response.json({ error: 'Campos requeridos faltantes: consulta_usuario, consulta_correcta, enunciado' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (!apiKey) {
      return Response.json({ error: 'Servicio de análisis no configurado' }, { status: 500 })
    }

    const formatResult = (rows: any[][]) => {
      if (!rows || rows.length === 0) return '(sin resultados)'
      return rows.slice(0, 5).map(row => row.join(' | ')).join('\n')
    }

    const prompt = `Sos un entrevistador técnico senior evaluando una solución SQL de un candidato en una entrevista de trabajo.

Problema planteado:
${enunciado}

Query del candidato:
${consulta_usuario}

Query de referencia (solución correcta):
${consulta_correcta}

Resultado obtenido por el candidato (primeras filas):
${formatResult(resultado_usuario)}

Resultado correcto esperado (primeras filas):
${formatResult(resultado_correcto)}

Analizá la solución del candidato y respondé ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional, con este formato exacto:
{"es_correcta": boolean, "feedback": "string con el análisis"}

El campo feedback debe:
- Indicar si la lógica es correcta y por qué produce (o no) el resultado esperado
- Señalar si hay una forma más eficiente o idiomática de escribir el query
- Destacar el aprendizaje clave que el candidato puede llevarse
- Usar tono constructivo y profesional, como en una entrevista técnica real
- Tener entre 3 y 5 oraciones en español`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return Response.json({ error: 'Error al contactar el servicio de análisis' }, { status: 502 })
    }

    const data = await response.json() as { content: { type: string; text: string }[] }
    const text = data.content?.[0]?.text?.trim() ?? ''

    let parsed: { es_correcta: boolean; feedback: string }
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text)
    } catch {
      return Response.json({ feedback: text, es_correcta: false })
    }

    return Response.json({ feedback: parsed.feedback, es_correcta: parsed.es_correcta })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
