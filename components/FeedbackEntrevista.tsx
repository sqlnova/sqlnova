'use client'
import { useState } from 'react'

interface Props {
  consultaUsuario: string
  consultaCorrecta: string
  enunciado: string
  resultadoUsuario: any[][]
  resultadoCorrecto: any[][]
}

export default function FeedbackEntrevista({
  consultaUsuario,
  consultaCorrecta,
  enunciado,
  resultadoUsuario,
  resultadoCorrecto,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [esCorrecta, setEsCorrecta] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const analizar = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback-entrevista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consulta_usuario: consultaUsuario,
          consulta_correcta: consultaCorrecta,
          enunciado,
          resultado_usuario: resultadoUsuario,
          resultado_correcto: resultadoCorrecto,
        }),
      })
      const data = await res.json()
      if (data.feedback) {
        setFeedback(data.feedback)
        setEsCorrecta(data.es_correcta)
      } else {
        setError('No se pudo obtener el análisis. Intentá de nuevo.')
      }
    } catch {
      setError('Error al conectar con el servicio de análisis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 14 }}>
      {!feedback && (
        <button
          onClick={analizar}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(77,166,255,0.08)',
            border: '1px solid rgba(77,166,255,0.28)',
            borderRadius: 9,
            padding: '9px 17px',
            color: 'var(--nova)',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.84rem',
            fontWeight: 600,
            opacity: loading ? 0.75 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(77,166,255,0.14)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(77,166,255,0.08)' }}
        >
          {loading ? (
            <>
              <span style={{
                display: 'inline-block',
                width: 13,
                height: 13,
                border: '2px solid rgba(77,166,255,0.3)',
                borderTopColor: 'var(--nova)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
              }} />
              Analizando tu solución...
            </>
          ) : (
            <>✨ Analizar con IA</>
          )}
        </button>
      )}

      {error && (
        <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--red)' }}>{error}</div>
      )}

      {feedback && (
        <div style={{
          marginTop: 14,
          background: esCorrecta ? 'rgba(62,207,142,0.05)' : 'rgba(229,83,75,0.05)',
          border: `1px solid ${esCorrecta ? 'rgba(62,207,142,0.2)' : 'rgba(229,83,75,0.2)'}`,
          borderRadius: 12,
          padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{esCorrecta ? '✅' : '❌'}</span>
            <span style={{
              fontSize: '0.73rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: esCorrecta ? 'var(--green)' : 'var(--red)',
            }}>
              {esCorrecta ? 'Solución correcta' : 'Revisar solución'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--sub)', marginLeft: 'auto' }}>✨ Análisis IA</span>
          </div>

          <div style={{
            fontSize: '0.87rem',
            color: 'var(--text)',
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
          }}>
            {feedback}
          </div>

          <button
            onClick={() => { setFeedback(null); setEsCorrecta(null) }}
            style={{
              marginTop: 13,
              background: 'transparent',
              border: 'none',
              color: 'var(--sub)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Volver a analizar
          </button>
        </div>
      )}
    </div>
  )
}
