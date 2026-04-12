'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { MODULOS } from '@/lib/curriculum'

// Activity calendar helpers
function buildCalendarData(completadaEnDates: string[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const isoStr of completadaEnDates) {
    const day = isoStr.split('T')[0] // YYYY-MM-DD
    map.set(day, (map.get(day) || 0) + 1)
  }
  return map
}

function getCalendarDays(): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Go back to the most recent Sunday to align weeks
  const dayOfWeek = today.getDay() // 0 = Sunday
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - dayOfWeek - 7 * 51) // 52 weeks back
  const days: Date[] = []
  const cur = new Date(startDate)
  while (cur <= today) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ActivityCalendar({ activityMap }: { activityMap: Map<string, number> }) {
  const days = getCalendarDays()
  const today = toYMD(new Date())

  // Group by week
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const cellColor = (count: number, isToday: boolean): string => {
    if (isToday && count === 0) return 'rgba(77,166,255,0.15)'
    if (count === 0) return 'var(--bg3)'
    if (count === 1) return 'rgba(62,207,142,0.25)'
    if (count <= 3) return 'rgba(62,207,142,0.5)'
    return 'rgba(62,207,142,0.85)'
  }

  const cellBorder = (count: number, isToday: boolean): string => {
    if (isToday) return '1px solid rgba(77,166,255,0.4)'
    if (count > 0) return '1px solid rgba(62,207,142,0.2)'
    return '1px solid var(--border)'
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const firstDay = week[0]
    if (firstDay && firstDay.getMonth() !== lastMonth) {
      lastMonth = firstDay.getMonth()
      monthLabels.push({
        label: firstDay.toLocaleString('es', { month: 'short' }),
        col: wi,
      })
    }
  })

  const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const totalActive = activityMap.size
  const totalLecciones = Array.from(activityMap.values()).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>
          {totalLecciones} lecciones en {totalActive} día{totalActive !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--dim)' }}>Menos</span>
          {[0, 1, 2, 4, 6].map(v => (
            <div key={v} style={{ width: 10, height: 10, borderRadius: 2, background: cellColor(v, false), border: cellBorder(v, false) }} />
          ))}
          <span style={{ fontSize: '0.62rem', color: 'var(--dim)' }}>Más</span>
        </div>
      </div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 2, minWidth: 'max-content' }}>
          {/* Day labels column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 18 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{ height: 11, fontSize: '0.55rem', color: i % 2 === 0 ? 'var(--sub)' : 'transparent', display: 'flex', alignItems: 'center', paddingRight: 4, fontFamily: 'DM Mono', width: 22 }}>{d}</div>
            ))}
          </div>
          {/* Weeks grid */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Month labels row */}
            <div style={{ display: 'flex', gap: 2, height: 16, marginBottom: 2 }}>
              {weeks.map((_, wi) => {
                const ml = monthLabels.find(m => m.col === wi)
                return (
                  <div key={wi} style={{ width: 11, fontSize: '0.58rem', color: 'var(--sub)', fontFamily: 'DM Mono', whiteSpace: 'nowrap', overflow: 'visible' }}>
                    {ml ? ml.label : ''}
                  </div>
                )
              })}
            </div>
            {/* Grid */}
            <div style={{ display: 'flex', gap: 2 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {week.map((day, di) => {
                    const ymd = toYMD(day)
                    const count = activityMap.get(ymd) || 0
                    const isToday = ymd === today
                    return (
                      <div
                        key={di}
                        title={`${ymd}: ${count} lección${count !== 1 ? 'es' : ''}`}
                        style={{
                          width: 11, height: 11, borderRadius: 2,
                          background: cellColor(count, isToday),
                          border: cellBorder(count, isToday),
                          cursor: count > 0 ? 'default' : 'default',
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<any>(null)
  const [alias, setAlias] = useState('')
  const [tema, setTema] = useState<'oscuro' | 'claro'>('oscuro')
  const [mostrarLeaderboard, setMostrarLeaderboard] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [leccionesCompletadas, setLeccionesCompletadas] = useState(0)
  const [modulosCompletados, setModulosCompletados] = useState(0)
  const [activityMap, setActivityMap] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }

      const [{ data: p }, { data: progreso }] = await Promise.all([
        sb.from('perfiles').select('*').eq('id', session.user.id).single(),
        sb.from('progreso').select('leccion_id, completada, completada_en').eq('usuario_id', session.user.id),
      ])

      if (p) {
        setPerfil(p)
        setAlias(p.alias || '')
        setTema(p.tema || 'oscuro')
        setMostrarLeaderboard(p.mostrar_en_leaderboard ?? true)

        const t = p.tema || 'oscuro'
        if (t === 'claro') {
          document.documentElement.setAttribute('data-theme', 'claro')
        } else {
          document.documentElement.removeAttribute('data-theme')
        }
      }

      if (progreso) {
        const prog: Record<string, boolean> = {}
        const dates: string[] = []
        for (const r of progreso) {
          prog[r.leccion_id] = r.completada
          if (r.completada && r.completada_en) dates.push(r.completada_en)
        }

        const totalDone = Object.values(prog).filter(Boolean).length
        setLeccionesCompletadas(totalDone)

        const modulosDone = MODULOS.filter(m => {
          const prefix = String(m.id).padStart(2, '0') + '-'
          const done = Object.keys(prog).filter(k => k.startsWith(prefix) && prog[k]).length
          return done >= m.lecciones_total
        }).length
        setModulosCompletados(modulosDone)
        setActivityMap(buildCalendarData(dates))
      }

      setLoading(false)
    }
    load()
  }, [router])

  const aplicarTemaVisual = (nuevoTema: 'oscuro' | 'claro') => {
    if (nuevoTema === 'claro') {
      document.documentElement.setAttribute('data-theme', 'claro')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc')
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#08090d')
    }
    localStorage.setItem('sqlnova-tema', nuevoTema)
  }

const save = async () => {
    if (!perfil) return
    
    // 1. Limpiamos espacios al principio y al final
    const aliasLimpio = alias.trim()

    // 2. Validaciones estrictas
    if (aliasLimpio.length > 0) {
      // No permitimos espacios internos en el alias (estándar de usernames)
      if (/\s/.test(aliasLimpio)) {
        setMsg({ tipo: 'error', texto: 'El alias no puede contener espacios internos.' })
        return
      }
      
      // Validamos formato: Alfanumérico, puntos, guiones y longitud
      if (!/^[a-zA-Z0-9_\-\.]{3,20}$/.test(aliasLimpio)) {
        setMsg({ tipo: 'error', texto: 'Usá entre 3 y 20 caracteres (letras, números, punto o guiones).' })
        return
      }
    }

    setSaving(true)
    setMsg(null)

    const { error } = await sb.from('perfiles').update({
      alias: aliasLimpio || null, // Si está vacío después del trim, mandamos NULL
      tema,
      mostrar_en_leaderboard: mostrarLeaderboard,
      actualizado_en: new Date().toISOString(),
    }).eq('id', perfil.id)

    if (error) {
      setMsg({ tipo: 'error', texto: error.message.includes('unique') 
        ? 'Ese alias ya está en uso por otro usuario.' 
        : 'Error al guardar. Intentá de nuevo.' 
      })
    } else {
      setMsg({ tipo: 'ok', texto: '¡Configuración guardada correctamente!' })
      setAlias(aliasLimpio) // Actualizamos el input con el texto ya limpio
      aplicarTemaVisual(tema)
    }
    setSaving(false)
  }

  const logout = async () => {
    await sb.auth.signOut()
    router.replace('/auth')
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', gap: 16 }}>
      <div style={{ width: 30, height: 30, border: '3px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: 'var(--sub)', fontSize: '0.85rem', fontFamily: 'DM Mono' }}>Cargando perfil...</div>
    </div>
  )

  const esPremium = perfil?.es_premium || false
  const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 14 }
  const label: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 10, display: 'block' }
  const input: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1, background: 'var(--bg)' }}>
      
      {/* TopBar */}
      <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', color: 'var(--sub)', fontSize: '0.78rem', cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--nova)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SQLNova</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Mi perfil {esPremium && <span>💎</span>}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '28px 20px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* Stats */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, textAlign: 'center' }}>
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
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>📚</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--nova)', fontFamily: 'DM Mono' }}>{leccionesCompletadas}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>Lecciones</div>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>🎓</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--nova)', fontFamily: 'DM Mono' }}>{modulosCompletados}/{MODULOS.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>Módulos</div>
            </div>
          </div>
        </div>

        {/* Activity Calendar */}
        <div style={card}>
          <span style={label}>Actividad · últimas 52 semanas</span>
          <ActivityCalendar activityMap={activityMap} />
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
          <div style={{ fontSize: '0.7rem', color: 'var(--dim)', marginTop: 8 }}>Este nombre aparecerá en el ranking global.</div>
        </div>

        {/* Leaderboard Toggle */}
        <div style={card}>
          <span style={label}>Privacidad</span>
          <div 
            onClick={() => setMostrarLeaderboard(!mostrarLeaderboard)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)' }}>
              Mostrarme en el ranking
            </div>
            <div style={{ 
              width: 42, 
              height: 22, 
              borderRadius: 20, 
              background: mostrarLeaderboard ? 'var(--green)' : 'var(--bg3)', 
              position: 'relative',
              transition: '0.2s'
            }}>
              <div style={{ 
                width: 18, 
                height: 18, 
                background: '#fff', 
                borderRadius: '50%', 
                position: 'absolute', 
                top: 2, 
                left: mostrarLeaderboard ? 22 : 2,
                transition: '0.2s'
              }} />
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div style={card}>
          <span style={label}>Apariencia</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['oscuro', 'claro'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTema(t); aplicarTemaVisual(t); }}
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

        {/* Cuenta y Premium */}
        <div style={card}>
          <span style={label}>Cuenta</span>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              {perfil?.nombre || 'Usuario'} 
              {esPremium && <span style={{ background: 'var(--nova)', color: '#fff', fontSize: '0.55rem', padding: '2px 5px', borderRadius: 4 }}>PREMIUM</span>}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--sub)' }}>{perfil?.email}</div>
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--red)', borderRadius: 9, padding: '8px 16px', color: 'var(--red)', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500 }}>
            Cerrar sesión
          </button>
        </div>

        {msg && (
          <div style={{ 
            padding: '12px', 
            borderRadius: 10, 
            marginBottom: 14, 
            background: msg.tipo === 'ok' ? 'rgba(62,207,142,0.1)' : 'rgba(229,83,75,0.1)', 
            border: `1px solid ${msg.tipo === 'ok' ? 'var(--green)' : 'var(--red)'}`, 
            color: msg.tipo === 'ok' ? 'var(--green)' : 'var(--red)', 
            textAlign: 'center', 
            fontSize: '0.88rem' 
          }}>
            {msg.texto}
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, cursor: 'pointer', width: '100%', opacity: saving ? 0.7 : 1, marginBottom: 40 }}
        >
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}
