'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sb, Perfil, Progreso } from '@/lib/supabase'
import { MODULOS } from '@/lib/curriculum'

const NIVELES = ['', 'Aprendiz', 'Explorador', 'Analista', 'Experto', 'Maestro SQL']

export default function Dashboard() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [prog, setProg] = useState<Record<string, Progreso>>({})
  const [dropOpen, setDropOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [retoPopup, setRetoPopup] = useState(false)
  const [tieneRetoHoy, setTieneRetoHoy] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await sb.auth.getSession()
      
      if (!session) { 
        router.replace('/auth')
        return 
      }

      const uid = session.user.id

      let { data: p } = await sb.from('perfiles').select('*').eq('id', uid).maybeSingle()
      
      if (!p) {
        const { data: newProfile } = await sb.from('perfiles')
          .insert({
            id: uid,
            nombre: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
            email: session.user.email,
          })
          .select()
          .single()
        p = newProfile
      }
      setPerfil(p)

      const hoy = new Date().toLocaleDateString('sv-SE')
      
      const [progRes, retosRes] = await Promise.all([
        sb.from('progreso').select('*').eq('usuario_id', uid),
        sb.from('retos').select('id').eq('fecha', hoy).eq('activo', true).limit(1)
      ])

      const progMap: Record<string, Progreso> = {}
      ;(progRes.data || []).forEach((r: Progreso) => { progMap[r.leccion_id] = r })
      setProg(progMap)

      if (retosRes.data && retosRes.data.length > 0) {
        const retoId = retosRes.data[0].id
        const { data: completado } = await sb.from('retos_completados')
          .select('reto_id')
          .eq('usuario_id', uid)
          .eq('reto_id', retoId)
          .maybeSingle()

        setTieneRetoHoy(true)
        if (!completado) {
          setRetoPopup(true)
        }
      }
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { 
    loadData() 
  }, [loadData])

  const logout = async () => {
    await sb.auth.signOut()
    router.replace('/auth')
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', gap: 16 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ color: 'var(--sub)', fontSize: '0.85rem' }}>Cargando tu progreso...</div>
    </div>
  )

  const xp = perfil?.xp_total || 0
  const nivel = Math.min(Math.floor(xp / 500) + 1, NIVELES.length - 1)
  const xpEnNivel = xp % 500
  const nombre = perfil?.nombre || 'Amigo'
  const iniciales = nombre.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  const leccionesCompletadas = Object.values(prog).filter(p => p.completada).length
  const esPremium = (perfil as any)?.es_premium || false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* NAV */}
      <nav style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', padding: '0 clamp(12px,3vw,22px)', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.08rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
          SQL<span style={{ color: 'var(--nova)' }}>Nova</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => router.push('/retos')}
            style={{ background: tieneRetoHoy ? 'rgba(232,168,56,0.12)' : 'var(--bg3)', border: `1px solid ${tieneRetoHoy ? 'rgba(232,168,56,0.4)' : 'var(--border)'}`, borderRadius: 8, padding: '4px 10px', color: 'var(--amber)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>⚡{tieneRetoHoy && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />}</span>
          </button>
          
          <button
            onClick={() => router.push('/leaderboard')}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--amber)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
          >
            🏆
          </button>

          <Pill color="var(--amber)">{perfil?.racha_actual || 0}🔥</Pill>
          <Pill color="var(--nova)">{xp}⚡</Pill>

          <div style={{ position: 'relative' }}>
            <div onClick={() => setDropOpen(!dropOpen)} style={{ width: 31, height: 31, borderRadius: '50%', background: 'rgba(77,166,255,0.11)', border: '1px solid rgba(77,166,255,0.24)', color: 'var(--nova)', fontSize: '0.73rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 4, position: 'relative' }}>
              {iniciales}
              {esPremium && <div style={{ position: 'absolute', bottom: -2, right: -2, fontSize: '0.6rem' }}>💎</div>}
            </div>
            {dropOpen && (
              <div style={{ position: 'absolute', right: 0, top: 38, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 12, padding: 6, minWidth: 170, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200 }}>
                <div style={{ padding: '7px 11px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {nombre} {esPremium && <span style={{ fontSize: '0.7rem' }}>💎</span>}
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <div onClick={() => { setDropOpen(false); router.push('/pocket') }} style={{ padding: '7px 11px', borderRadius: 7, fontSize: '0.84rem', cursor: 'pointer', color: 'var(--nova)', fontWeight: 600 }}>🗄️ Pocket Database</div>
                <div onClick={() => { setDropOpen(false); router.push('/perfil') }} style={{ padding: '7px 11px', borderRadius: 7, fontSize: '0.84rem', cursor: 'pointer', color: 'var(--text)' }}>⚙️ Mi perfil</div>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <div onClick={logout} style={{ padding: '7px 11px', borderRadius: 7, fontSize: '0.84rem', cursor: 'pointer', color: 'var(--red)' }}>Cerrar sesión</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: '34px 22px', maxWidth: 940, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Hola, {nombre.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--sub)', fontSize: '0.88rem' }}>Cada lección te acerca más al dominio total del SQL.</p>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 11, marginBottom: 26 }}>
          <StatCard value={xp} label="XP total" color="var(--nova)" />
          <StatCard value={`${perfil?.racha_actual || 0} 🔥`} label="Días de racha" color="var(--amber)" />
          <StatCard value={leccionesCompletadas} label="Lecciones" color="var(--green)" />
        </div>

        {/* LEVEL */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 13, padding: '18px 22px', marginBottom: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Nivel {nivel} — {NIVELES[nivel]}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{xpEnNivel} / 500 XP</div>
          </div>
          <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 5, background: 'var(--nova)', width: `${(xpEnNivel / 500) * 100}%`, transition: 'width 0.5s ease-out' }} />
          </div>
        </div>

        {/* CURRICULO */}
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Currículo</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10, marginBottom: 32 }}>
          {MODULOS.map((m, i) => {
            const prefix = m.id === 0 ? '00-' : `0${m.id}-`
            const done = Object.keys(prog).filter(k => k.startsWith(prefix) && prog[k]?.completada).length
            const pct = Math.round((done / m.lecciones_total) * 100)
            const locked = i > 1 && Object.keys(prog).length < i * 5
            const completed = pct === 100

            return (
              <div
                key={m.id}
                onClick={() => !locked && router.push(`/leccion/${m.id}`)}
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${completed ? 'rgba(62,207,142,0.18)' : 'var(--border)'}`,
                  borderRadius: 13,
                  padding: '17px 19px',
                  cursor: locked ? 'default' : 'pointer',
                  opacity: locked ? 0.42 : 1,
                  transition: 'all 0.13s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 11 }}>
                  <span style={{ fontSize: '1.15rem' }}>{m.icono}</span>
                  <div>
                    <div style={{ fontSize: '0.93rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{m.titulo}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--sub)' }}>{m.contexto} · {m.lecciones_total} lecc.</div>
                  </div>
                </div>
                {m.id !== 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 3, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: 'var(--nova2)', width: `${pct}%` }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--sub)', fontFamily: 'DM Mono', minWidth: 26, textAlign: 'right' }}>{pct}%</div>
                  </div>
                )}
                <span style={{
                  display: 'inline-block', fontSize: '0.67rem', fontWeight: 600, padding: '3px 8px',
                  borderRadius: 5, marginTop: 9, letterSpacing: '0.02em',
                  background: completed ? 'rgba(62,207,142,0.09)' : locked ? 'rgba(255,255,255,0.04)' : 'rgba(77,166,255,0.09)',
                  color: completed ? 'var(--green)' : locked ? 'var(--dim)' : 'var(--nova)',
                }}>
                  {completed ? '✓ Completado' : locked ? '🔒 Bloqueado' : '▶ Empezar'}
                </span>
              </div>
            )
          })}
        </div>

{/* PREMIUM SECTION ACTUALIZADA Y CENTRADA */}
<div style={{ marginBottom: 40 }}>
  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
    Premium
  </div>
  
  <div 
    onClick={() => router.push('/pocket')}
    style={{ 
      background: 'var(--card)', 
      border: `1px solid ${esPremium ? 'rgba(77,166,255,0.3)' : 'rgba(167,139,250,0.2)'}`, 
      borderRadius: 16, 
      padding: '24px', 
      display: 'flex', 
      flexDirection: 'column', // Por defecto columna (mobile)
      alignItems: 'center',    // Centrado en mobile
      textAlign: 'center',     // Texto centrado en mobile
      gap: 20,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    }}
    className="group md:flex-row md:text-left md:align-start" // Usamos clases para el cambio a fila en pantallas grandes
  >
    {/* Estilo dinámico para el cambio a fila en Desktop vía Inline (para asegurar compatibilidad) */}
    <style jsx>{`
      @media (min-width: 640px) {
        div.premium-card {
          flex-direction: row !important;
          text-align: left !important;
          align-items: center !important;
        }
      }
    `}</style>

    {/* Icono con fondo sutil */}
    <div style={{ 
      fontSize: '2.5rem', 
      background: esPremium ? 'rgba(77,166,255,0.1)' : 'rgba(167,139,250,0.1)', 
      width: 80, 
      height: 80, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderRadius: 20,
      flexShrink: 0
    }}>
      🗄️
    </div>

    {/* Texto Central */}
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }} className="md:justify-start">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
          Pocket Database
        </h3>
        <span style={{ 
          fontSize: '0.65rem', 
          fontWeight: 800, 
          padding: '3px 8px', 
          borderRadius: 6, 
          background: esPremium ? 'var(--nova)' : 'rgba(167,139,250,0.15)', 
          color: esPremium ? '#fff' : '#a78bfa',
          whiteSpace: 'nowrap'
        }}>
          {esPremium ? 'ACTIVO ✨' : 'NUEVO'}
        </span>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--sub)', lineHeight: 1.6, margin: 0, maxWidth: '400px' }}>
        Subí tus propios CSV y explorá tus datos con SQL localmente. Privacidad total garantizada.
      </p>
    </div>

    {/* Botón Inferior en mobile / Derecha en Desktop */}
    <div style={{ width: '100%' }} className="md:w-auto">
      <div style={{ 
        background: esPremium ? 'var(--nova2)' : 'var(--bg3)', 
        color: '#fff', 
        borderRadius: 12, 
        padding: '12px 24px', 
        fontSize: '0.9rem', 
        fontWeight: 700, 
        textAlign: 'center',
        transition: 'all 0.2s'
      }}>
        Entrar →
      </div>
    </div>
  </div>
</div>

      {/* MODAL RETOS */}
      {retoPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--card)', border: '1px solid rgba(232,168,56,0.3)', borderRadius: 16, padding: '28px 24px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>¡Retos del día listos!</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--sub)', lineHeight: 1.7, marginBottom: 20 }}>
              Completar los retos diarios te otorga XP extra para subir en el leaderboard semanal.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRetoPopup(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px', color: 'var(--sub)', cursor: 'pointer' }}>Luego</button>
              <button onClick={() => { setRetoPopup(false); router.push('/retos') }} style={{ flex: 2, background: 'var(--amber)', color: '#1a0f00', border: 'none', borderRadius: 9, padding: '10px', fontWeight: 700, cursor: 'pointer' }}>¡Ir a retos! →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', fontWeight: 500, color: 'var(--sub)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 100, padding: '4px 11px' }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {children}
    </div>
  )
}

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 13, padding: '18px 20px' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4, color }}>{value}</div>
      <div style={{ fontSize: '0.76rem', color: 'var(--sub)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}
