'use client'
import { useEffect, useState, useCallback } from ‘react’
import { useRouter } from ‘next/navigation’
import { sb, Perfil, Progreso } from ‘@/lib/supabase’
import { MODULOS } from ‘@/lib/curriculum’

const NIVELES = [’’, ‘Aprendiz’, ‘Explorador’, ‘Analista’, ‘Experto’, ‘Maestro SQL’]

export default function Dashboard() {
const router = useRouter()
const [perfil, setPerfil] = useState<Perfil | null>(null)
const [prog, setProg] = useState<Record<string, Progreso>>({})
const [dropOpen, setDropOpen] = useState(false)
const [loading, setLoading] = useState(true)
const [retoPopup, setRetoPopup] = useState(false)
const [tieneRetoHoy, setTieneRetoHoy] = useState(false)

const loadData = useCallback(async () => {
const { data: { session } } = await sb.auth.getSession()
if (!session) { router.replace(’/auth’); return }

```
const uid = session.user.id

let { data: p } = await sb.from('perfiles').select('*').eq('id', uid).single()
if (!p) {
  await sb.from('perfiles').insert({
    id: uid,
    nombre: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
    email: session.user.email,
  })
  const { data: p2 } = await sb.from('perfiles').select('*').eq('id', uid).single()
  p = p2
}
setPerfil(p)

const { data: progData } = await sb.from('progreso').select('*').eq('usuario_id', uid)
const progMap: Record<string, Progreso> = {}
;(progData || []).forEach((r: Progreso) => { progMap[r.leccion_id] = r })
setProg(progMap)

// Verificar si hay reto nuevo hoy sin completar
const hoy = new Date().toISOString().split('T')[0]
const { data: retosHoy } = await sb.from('retos').select('id').eq('fecha', hoy).eq('activo', true).limit(1)
if (retosHoy && retosHoy.length > 0) {
  const { data: completados } = await sb.from('retos_completados')
    .select('reto_id')
    .eq('usuario_id', uid)
    .in('reto_id', retosHoy.map((r: any) => r.id))
  setTieneRetoHoy(true)
  if (!completados || completados.length === 0) {
    setRetoPopup(true)
  }
}

setLoading(false)
```

}, [router])

useEffect(() => { loadData() }, [loadData])

const logout = async () => {
await sb.auth.signOut()
router.replace(’/auth’)
}

if (loading) return (
<div style={{ display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’, minHeight: ‘100vh’ }}>
<div style={{ width: 32, height: 32, border: ‘2px solid var(–border2)’, borderTopColor: ‘var(–nova)’, borderRadius: ‘50%’, animation: ‘spin 0.7s linear infinite’ }} />
</div>
)

const xp = perfil?.xp_total || 0
const nivel = Math.min(Math.floor(xp / 500) + 1, NIVELES.length - 1)
const xpEnNivel = xp % 500
const nombre = perfil?.nombre || ‘amigo’
const iniciales = nombre.split(’ ‘).map((n: string) => n[0]).join(’’).toUpperCase().slice(0, 2)
const leccionesCompletadas = Object.values(prog).filter(p => p.completada).length

return (
<div style={{ display: ‘flex’, flexDirection: ‘column’, minHeight: ‘100vh’, position: ‘relative’, zIndex: 1 }}>
{/* NAV */}
<nav style={{ background: ‘var(–nav-bg)’, borderBottom: ‘1px solid var(–border)’, backdropFilter: ‘blur(14px)’, padding: ‘0 clamp(12px,3vw,22px)’, height: 52, display: ‘flex’, alignItems: ‘center’, justifyContent: ‘space-between’, position: ‘sticky’, top: 0, zIndex: 100 }}>
<div style={{ fontSize: ‘1.08rem’, fontWeight: 700, letterSpacing: ‘-0.04em’ }}>
SQL<span style={{ color: ‘var(–nova)’ }}>Nova</span>
</div>
<div style={{ display: ‘flex’, alignItems: ‘center’, gap: 4 }}>
{/* Retos button */}
<button
onClick={() => router.push(’/retos’)}
style={{ background: tieneRetoHoy ? ‘rgba(232,168,56,0.12)’ : ‘var(–bg3)’, border: `1px solid ${tieneRetoHoy ? 'rgba(232,168,56,0.4)' : 'var(--border)'}`, borderRadius: 8, padding: ‘4px 10px’, color: ‘var(–amber)’, fontSize: ‘0.76rem’, fontWeight: 600, cursor: ‘pointer’, display: ‘flex’, alignItems: ‘center’, gap: 4 }}
>
<span style={{ display: ‘flex’, alignItems: ‘center’, gap: 3 }}>⚡{tieneRetoHoy && <span style={{ width: 5, height: 5, borderRadius: ‘50%’, background: ‘var(–amber)’, display: ‘inline-block’ }} />}</span>
</button>
{/* Leaderboard button */}
<button
onClick={() => router.push(’/leaderboard’)}
style={{ background: ‘var(–bg3)’, border: ‘1px solid var(–border)’, borderRadius: 8, padding: ‘4px 10px’, color: ‘var(–amber)’, fontSize: ‘0.76rem’, fontWeight: 600, cursor: ‘pointer’, display: ‘flex’, alignItems: ‘center’, gap: 4 }}
>
🏆
</button>
<Pill color="var(--amber)">{perfil?.racha_actual || 0}🔥</Pill>
<Pill color="var(--nova)">{xp}⚡</Pill>
<div style={{ position: ‘relative’ }}>
<div onClick={() => setDropOpen(!dropOpen)} style={{ width: 31, height: 31, borderRadius: ‘50%’, background: ‘rgba(77,166,255,0.11)’, border: ‘1px solid rgba(77,166,255,0.24)’, color: ‘var(–nova)’, fontSize: ‘0.73rem’, fontWeight: 600, display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’, cursor: ‘pointer’, marginLeft: 4 }}>
{iniciales}
</div>
{dropOpen && (
<div style={{ position: ‘absolute’, right: 0, top: 38, background: ‘var(–card)’, border: ‘1px solid var(–border2)’, borderRadius: 12, padding: 6, minWidth: 170, boxShadow: ‘0 8px 24px rgba(0,0,0,0.4)’, zIndex: 200 }}>
<div style={{ padding: ‘7px 11px’, fontSize: ‘0.84rem’, fontWeight: 600, color: ‘var(–text)’ }}>{nombre}</div>
<div style={{ height: 1, background: ‘var(–border)’, margin: ‘4px 0’ }} />
<div onClick={() => { setDropOpen(false); router.push(’/retos’) }} style={{ padding: ‘7px 11px’, borderRadius: 7, fontSize: ‘0.84rem’, cursor: ‘pointer’, color: ‘var(–amber)’, display: ‘flex’, alignItems: ‘center’, gap: 8 }}>
⚡ Retos diarios {tieneRetoHoy && <span style={{ width: 6, height: 6, borderRadius: ‘50%’, background: ‘var(–amber)’, marginLeft: ‘auto’ }} />}
</div>
<div onClick={() => { setDropOpen(false); router.push(’/leaderboard’) }} style={{ padding: ‘7px 11px’, borderRadius: 7, fontSize: ‘0.84rem’, cursor: ‘pointer’, color: ‘var(–amber)’, display: ‘flex’, alignItems: ‘center’, gap: 8 }}>
🏆 Leaderboard
</div>
<div onClick={() => { setDropOpen(false); router.push(’/perfil’) }} style={{ padding: ‘7px 11px’, borderRadius: 7, fontSize: ‘0.84rem’, cursor: ‘pointer’, color: ‘var(–text)’, display: ‘flex’, alignItems: ‘center’, gap: 8 }}>
⚙️ Mi perfil
</div>
<div style={{ height: 1, background: ‘var(–border)’, margin: ‘4px 0’ }} />
<div onClick={logout} style={{ padding: ‘7px 11px’, borderRadius: 7, fontSize: ‘0.84rem’, cursor: ‘pointer’, color: ‘var(–red)’ }}>Cerrar sesión</div>
</div>
)}
</div>
</div>
</nav>

```
  {/* CONTENT */}
  <div style={{ flex: 1, padding: '34px 22px', maxWidth: 940, margin: '0 auto', width: '100%', animation: 'fadeUp 0.3s ease both' }}>
    <div style={{ marginBottom: 30 }}>
      <h1 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Hola, {nombre.split(' ')[0]} 👋</h1>
      <p style={{ color: 'var(--sub)', fontSize: '0.88rem' }}>Cada lección te acerca más al dominio total del SQL.</p>
    </div>

    {/* STATS */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 11, marginBottom: 26 }}>
      <StatCard value={xp} label="XP total" color="var(--nova)" />
      <StatCard value={`${perfil?.racha_actual || 0} 🔥`} label="Días de racha" color="var(--amber)" />
      <StatCard value={leccionesCompletadas} label="Lecciones completadas" color="var(--green)" />
    </div>

    {/* LEVEL */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 13, padding: '18px 22px', marginBottom: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Nivel {nivel} — {NIVELES[nivel]}</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{xpEnNivel} / 500 XP</div>
      </div>
      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 5, overflow: 'hidden' }}>
        <div className="level-fill" style={{ height: '100%', borderRadius: 5, width: `${(xpEnNivel / 500) * 100}%` }} />
      </div>
    </div>

    {/* MODULES */}
    {/* Pop-up de reto del día */}
    {retoPopup && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'var(--card)', border: '1px solid rgba(232,168,56,0.3)', borderRadius: 16, padding: '28px 24px', maxWidth: 400, width: '100%', textAlign: 'center', animation: 'fadeUp 0.25s ease both' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>¡Nuevos retos disponibles!</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--sub)', lineHeight: 1.7, marginBottom: 20 }}>
            Tenés 3 retos de SQL para hoy — nivel inicial, avanzado y experto.<br/>
            Completarlos suma XP al leaderboard semanal.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
            {[['⭐','Inicial','15 XP','var(--green)'],['⭐⭐','Avanzado','30 XP','var(--nova)'],['⭐⭐⭐','Experto','50 XP','var(--amber)']].map(([ico,lbl,xp,color]) => (
              <div key={String(lbl)} style={{ background: 'var(--bg2)', borderRadius: 8, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', marginBottom: 4 }}>{ico}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: color as string }}>{lbl}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{xp}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setRetoPopup(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px', color: 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>Después</button>
            <button onClick={() => { setRetoPopup(false); router.push('/retos') }} style={{ flex: 2, background: 'var(--amber)', color: '#1a0f00', border: 'none', borderRadius: 9, padding: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>¡Empezar retos! →</button>
          </div>
        </div>
      </div>
    )}

    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Currículo</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
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
                <div style={{ fontSize: '0.73rem', color: 'var(--sub)' }}>{m.contexto} · {m.lecciones_total} lecciones</div>
              </div>
            </div>
            {m.id !== 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'var(--nova2)', width: `${pct}%`, transition: 'width 0.4s' }} />
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
  </div>

    {/* Pocket Database - Coming Soon */}
    <div style={{ marginTop: 32, marginBottom: 8 }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Premium</div>
      <div style={{ background: 'var(--card)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 13, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>🗄️</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Pocket Database</div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>PRÓXIMAMENTE</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--sub)', lineHeight: 1.6 }}>
            Subí tu propio CSV, explorá tus datos y corré queries SQL directamente en el browser. Con normalización automática de columnas y export de resultados.
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 9, padding: '8px 14px', fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600, cursor: 'default' }}>
            Pronto ✨
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
```

)
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
return (
<div style={{ display: ‘flex’, alignItems: ‘center’, gap: 5, fontSize: ‘0.77rem’, fontWeight: 500, color: ‘var(–sub)’, background: ‘var(–bg3)’, border: ‘1px solid var(–border)’, borderRadius: 100, padding: ‘4px 11px’ }}>
<div style={{ width: 5, height: 5, borderRadius: ‘50%’, background: color }} />
{children}
</div>
)
}

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
return (
<div style={{ background: ‘var(–card)’, border: ‘1px solid var(–border)’, borderRadius: 13, padding: ‘18px 20px’ }}>
<div style={{ fontSize: ‘1.75rem’, fontWeight: 700, letterSpacing: ‘-0.04em’, lineHeight: 1, marginBottom: 4, color }}>{value}</div>
<div style={{ fontSize: ‘0.76rem’, color: ‘var(–sub)’, fontWeight: 500 }}>{label}</div>
</div>
)
}