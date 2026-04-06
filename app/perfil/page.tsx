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
        
        // Sincronizar tema visual al cargar si no coincide
        const localTema = p.tema || 'oscuro'
        if (localTema === 'claro') {
          document.documentElement.setAttribute('data-theme', 'claro')
        } else {
          document.documentElement.removeAttribute('data-theme')
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  // Función para aplicar cambios visuales inmediatos
  const aplicarTemaVisual = (nuevoTema: 'oscuro' | 'claro') => {
    if (nuevoTema === 'claro') {
      document.documentElement.setAttribute('data-theme', 'claro')
      // Cambiar color de barra de sistema (Android)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc')
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#08090d')
    }
    localStorage.setItem('sqlnova-tema', nuevoTema)
  }

  const save = async () => {
    if (!perfil) return
    if (alias && !/^[a-zA-Z0-9_\-\.]{3,20}$/.test(alias)) {
      setMsg({ tipo: 'error', texto: 'Alias inválido (3-20 caracteres)' })
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
      setMsg({ tipo: 'error', texto: 'Error al guardar. ¿Alias duplicado?' })
    } else {
      setMsg({ tipo: 'ok', texto: '¡Configuración guardada!' })
      aplicarTemaVisual(tema) // Aplicar cambios visuales al confirmar
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
  const input: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1, background: 'var(--bg)' }}>
      
      {/* TopBar CORREGIDA: Usa var(--nav-bg) */}
      <div style={{ 
        background: 'var(--nav-bg)', 
        borderBottom: '1px solid var(--border)', 
        backdropFilter: 'blur(14px)', 
        padding: '0 16px', 
        height: 52, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', color: 'var(--sub)', fontSize: '0.78rem', cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--nova)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SQLNova</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>Mi perfil</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '28px 20px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

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
          <input
            style={input}
            value={alias}
            onChange={e => setAlias(e.target.value)}
            placeholder="ej: sqlmaster_99"
            maxLength={20}
          />
        </div>

        {/* Tema - Selector visual mejorado */}
        <div style={card}>
          <span style={label}>Apariencia</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['oscuro', 'claro'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTema(t);
                  aplicarTemaVisual(t); // Vista previa inmediata
                }}
                style={{
                  background: tema === t ? 'rgba(77,166,255,0.08)' : 'var(--bg2)',
                  border: `2px solid ${tema === t ? 'var(--nova)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{t === 'oscuro' ? '🌙' : '☀️'}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: tema === t ? 'var(--nova)' : 'var(--text)' }}>
                  {t === 'oscuro' ? 'Oscuro' : 'Claro'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cuenta */}
        <div style={card}>
          <span style={label}>Cuenta</span>
          <div style={{ fontSize: '0.86rem', color: 'var(--sub)', marginBottom: 14 }}>{perfil?.email}</div>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--red)', borderRadius: 9, padding: '8px 16px', color: 'var(--red)', cursor: 'pointer', fontSize: '0.84rem' }}>
            Cerrar sesión
          </button>
        </div>

        {msg && (
          <div style={{ padding: '12px', borderRadius: 10, marginBottom: 14, background: msg.tipo === 'ok' ? 'rgba(62,207,142,0.1)' : 'rgba(229,83,75,0.1)', border: `1px solid ${msg.tipo === 'ok' ? 'var(--green)' : 'var(--red)'}`, color: msg.tipo === 'ok' ? 'var(--green)' : 'var(--red)', textAlign: 'center', fontSize: '0.88rem' }}>
            {msg.texto}
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, cursor: 'pointer', width: '100%', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}
