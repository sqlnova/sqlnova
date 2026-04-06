'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'

export default function PerfilPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<any>(null)
  const [alias, setAlias] = useState('')
  const [tema, setTema] = useState<'oscuro' | 'claro'>('oscuro')
  const [mostrarLeaderboard, setMostrarLeaderboard] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      const { data: p } = await sb.from('perfiles').select('*').eq('id', session.user.id).single()
      if (p) {
        setPerfil(p)
        setAlias(p.alias || '')
        setTema(p.tema || 'oscuro')
        setMostrarLeaderboard(p.mostrar_en_leaderboard ?? true)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const save = async () => {
    if (!perfil) return
    if (alias && !/^[a-zA-Z0-9_\-\.]{3,20}$/.test(alias)) {
      setMsg({ tipo: 'error', texto: 'El alias debe tener entre 3 y 20 caracteres (letras, números, _ - .)' })
      return
    }
    setSaving(true)
    setMsg(null)
    const { error } = await sb.from('perfiles').update({
      alias: alias.trim() || null,
      tema,
      mostrar_en_leaderboard: mostrarLeaderboard,
      actualizado_en: new Date().toISOString(),
    }).eq('id', perfil.id)
    if (error) {
      setMsg({ tipo: 'error', texto: error.message.includes('unique') ? 'Ese alias ya está en uso, elegí otro.' : 'Error al guardar. Intentá de nuevo.' })
    } else {
      setMsg({ tipo: 'ok', texto: '¡Configuración guardada!' })
      // Aplicar tema al documento
      document.documentElement.setAttribute('data-theme', tema)
      localStorage.setItem('sqlnova-tema', tema)
    }
    setSaving(false)
  }

  const logout = async () => {
    await sb.auth.signOut()
    router.replace('/auth')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 14 }
  const label: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 10, display: 'block' }
  const input: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* TopBar */}
      <div style={{ background: 'rgba(8,9,13,0.88)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', color: 'var(--sub)', fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--nova)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SQLNova</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Mi perfil</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: 'clamp(16px,4vw,28px) clamp(14px,4vw,20px)', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* Stats */}
        <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, textAlign: 'center' }}>
          {[
            ['⭐', perfil?.xp_total ?? 0, 'XP Total'],
            ['🔥', perfil?.racha_actual ?? 0, 'Racha'],
            ['🏆', perfil?.racha_maxima ?? 0, 'Máx. racha'],
          ].map(([ico, val, lbl]) => (
            <div key={String(lbl)}>
              <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{ico}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--nova)', fontFamily: 'DM Mono' }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Alias */}
        <div style={card}>
          <span style={label}>Alias para el leaderboard</span>
          <p style={{ fontSize: '0.82rem', color: 'var(--sub)', marginBottom: 12, lineHeight: 1.6 }}>
            Tu alias es el nombre que aparece en el ranking semanal. Puede ser diferente a tu nombre real. Entre 3 y 20 caracteres (letras, números, guiones o puntos).
          </p>
          <input
            style={input}
            value={alias}
            onChange={e => setAlias(e.target.value)}
            placeholder="ej: sqlmaster_99"
            maxLength={20}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--dim)', marginTop: 6 }}>{alias.length}/20 caracteres</div>
        </div>

        {/* Leaderboard toggle */}
        <div style={card}>
          <span style={label}>Participación en el leaderboard</span>
          <div
            onClick={() => setMostrarLeaderboard(!mostrarLeaderboard)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '10px 0' }}
          >
            <div style={{
              width: 44, height: 24, borderRadius: 12, background: mostrarLeaderboard ? 'var(--nova2)' : 'var(--bg3)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0
            }}>
              <div style={{
                position: 'absolute', top: 3, left: mostrarLeaderboard ? 22 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s'
              }} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{mostrarLeaderboard ? 'Visible en el ranking' : 'Oculto del ranking'}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--sub)' }}>{mostrarLeaderboard ? 'Tu alias y XP aparecen en el leaderboard semanal' : 'Tu nombre no aparece públicamente'}</div>
            </div>
          </div>
        </div>

        {/* Tema */}
        <div style={card}>
          <span style={label}>Apariencia</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['oscuro', 'claro'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTema(t)}
                style={{
                  background: tema === t ? 'rgba(77,166,255,0.1)' : 'var(--bg2)',
                  border: `2px solid ${tema === t ? 'var(--nova)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{t === 'oscuro' ? '🌙' : '☀️'}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: tema === t ? 'var(--nova)' : 'var(--text)', textTransform: 'capitalize' }}>{t === 'oscuro' ? 'Modo oscuro' : 'Modo claro'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sub)', marginTop: 2 }}>{t === 'oscuro' ? 'Fondo negro, fácil para la vista' : 'Fondo blanco, ideal para el día'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cuenta */}
        <div style={card}>
          <span style={label}>Cuenta</span>
          <div style={{ fontSize: '0.86rem', color: 'var(--sub)', marginBottom: 14 }}>{perfil?.email}</div>
          <button onClick={logout} style={{ background: 'rgba(229,83,75,0.08)', border: '1px solid rgba(229,83,75,0.25)', borderRadius: 9, padding: '9px 18px', color: 'var(--red)', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500 }}>
            Cerrar sesión
          </button>
        </div>

        {/* Mensaje */}
        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, background: msg.tipo === 'ok' ? 'rgba(62,207,142,0.08)' : 'rgba(229,83,75,0.08)', border: `1px solid ${msg.tipo === 'ok' ? 'rgba(62,207,142,0.25)' : 'rgba(229,83,75,0.25)'}`, color: msg.tipo === 'ok' ? 'var(--green)' : 'var(--red)', fontSize: '0.86rem' }}>
            {msg.tipo === 'ok' ? '✓ ' : '✗ '}{msg.texto}
          </div>
        )}

        {/* Guardar */}
        <button
          onClick={save}
          disabled={saving}
          style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem', width: '100%', opacity: saving ? 0.7 : 1, marginBottom: 32 }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
