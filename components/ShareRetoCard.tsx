'use client'
import { useRef, useState } from 'react'

type ShareRetoCardProps = {
  nivel: 'inicial' | 'avanzado' | 'experto'
  enunciado: string
  fecha: string
  alias: string
  xpGanado: number
  onClose: () => void
}

const NIVEL_CFG = {
  inicial:  { label: 'Inicial',   stars: '⭐',       color: '#3ecf8e', bg: 'rgba(62,207,142,0.12)',  border: 'rgba(62,207,142,0.35)'  },
  avanzado: { label: 'Avanzado',  stars: '⭐⭐',     color: '#4da6ff', bg: 'rgba(77,166,255,0.12)',  border: 'rgba(77,166,255,0.35)'  },
  experto:  { label: 'Experto',   stars: '⭐⭐⭐',   color: '#e8a838', bg: 'rgba(232,168,56,0.12)', border: 'rgba(232,168,56,0.35)'  },
} as const

export default function ShareRetoCard({ nivel, enunciado, fecha, alias, xpGanado, onClose }: ShareRetoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const cfg = NIVEL_CFG[nivel]

  const fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const textoPlano = enunciado
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
  const enunciadoFinal = textoPlano.length > 220 ? textoPlano.slice(0, 220) + '…' : textoPlano

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#0f1117',
      })
      const a = document.createElement('a')
      a.download = 'sqlnova-reto-' + fecha + '.png'
      a.href = dataUrl
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 20, gap: 16,
      }}
    >
      {/* Card — rendered at 540×540, exported at 1080×1080 (pixelRatio 2) */}
      <div style={{ maxWidth: '100%', overflow: 'hidden', borderRadius: 20 }}>
        <div
          ref={cardRef}
          style={{
            width: 540,
            height: 540,
            background: '#0f1117',
            padding: '40px 44px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow — top right, level color */}
          <div style={{
            position: 'absolute', top: -80, right: -80, width: 260, height: 260,
            background: 'radial-gradient(circle, ' + cfg.color + '1a 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          {/* Glow — bottom left, cyan brand */}
          <div style={{
            position: 'absolute', bottom: -60, left: -60, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, position: 'relative' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #06b6d4 0%, #2d8fff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 18,
              fontFamily: "'DM Mono', 'Courier New', monospace",
            }}>S</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', letterSpacing: '-0.02em' }}>SQLNova</div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: cfg.color, background: cfg.bg,
                border: '1px solid ' + cfg.border,
                padding: '5px 12px', borderRadius: 20,
                display: 'inline-block',
              }}>
                {cfg.stars + ' ' + cfg.label}
              </span>
            </div>
          </div>

          {/* Enunciado */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ fontSize: 15, lineHeight: 1.7, color: '#c8cde8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
              {enunciadoFinal}
            </div>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '24px 0 20px' }} />

          {/* Completado row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#3ecf8e', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
                {'Completado por ' + alias}
              </div>
              <div style={{ fontSize: 13, marginTop: 3, color: xpGanado > 0 ? '#4da6ff' : '#8b8fa8', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
                {xpGanado > 0 ? '+' + xpGanado + ' XP ganados' : '+0 XP · completado con pista'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: '#3a3d52', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
              {fechaFormateada}
            </div>
            <div style={{ fontSize: 11, color: '#3a3d52', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
              {'Aprendé SQL en app.sqlnova.app'}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 540 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '12px 16px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, color: '#8b8fa8',
            cursor: 'pointer', fontSize: 14,
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          Cerrar
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            flex: 2, padding: '12px 16px',
            background: downloading ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg, #06b6d4 0%, #2d8fff 100%)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontWeight: 700,
            cursor: downloading ? 'default' : 'pointer',
            fontSize: 14,
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          {downloading ? 'Generando…' : '⬇ Descargar imagen'}
        </button>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
        {'1080×1080px · Optimizado para Instagram y LinkedIn'}
      </div>
    </div>
  )
}
