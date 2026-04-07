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
      if (!session) { router.replace('/auth'); return }

      const uid = session.user.id
      let { data: p } = await sb.from('perfiles').select('*').eq('id', uid).maybeSingle()
      if (p) {
        setPerfil(p)
        document.documentElement.setAttribute('data-theme', p.tema || 'oscuro')
      }

      const hoy = new Date().toLocaleDateString('sv-SE')
      const [progRes, retosRes] = await Promise.all([
        sb.from('progreso').select('*').eq('usuario_id', uid),
        sb.from('retos').select('id').eq('fecha', hoy).eq('activo', true).limit(1)
      ])

      const progMap: Record<string, Progreso> = {}
      ;(progRes.data || []).forEach((r: Progreso) => { progMap[r.leccion_id] = r })
      setProg(progMap)

      if (retosRes.data?.length) {
        const retoId = retosRes.data[0].id
        const { data: comp } = await sb.from('retos_completados').select('reto_id').eq('usuario_id', uid).eq('reto_id', retoId).maybeSingle()
        setTieneRetoHoy(true)
        if (!comp) setRetoPopup(true)
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const xp = perfil?.xp_total || 0
  const nivel = Math.min(Math.floor(xp / 500) + 1, NIVELES.length - 1)
  const xpEnNivel = xp % 500
  const iniciales = perfil?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SQ'

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="h-[52px] border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md sticky top-0 z-50 px-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tighter">SQL<span className="text-blue-500">Nova</span></div>
        <div className="flex items-center gap-2">
          <Pill color="#fbbf24">{perfil?.racha_actual || 0}🔥</Pill>
          <Pill color="#3b82f6">{xp}⚡</Pill>
          <div onClick={() => setDropOpen(!dropOpen)} className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center cursor-pointer">{iniciales}</div>
          {dropOpen && (
            <div className="absolute right-4 top-14 bg-[var(--card)] border border-[var(--border2)] rounded-xl p-2 min-w-[180px] shadow-2xl">
              <div onClick={() => router.push('/perfil')} className="px-3 py-2 text-xs rounded-lg cursor-pointer hover:bg-[var(--bg3)] text-[var(--text)]">⚙️ Mi perfil</div>
              <div onClick={() => sb.auth.signOut().then(() => router.replace('/auth'))} className="px-3 py-2 text-xs text-red-500 rounded-lg cursor-pointer">Cerrar sesión</div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Hola, {perfil?.nombre?.split(' ')[0]} 👋</h1>
          <p className="text-[var(--sub)] text-sm">Nivel {nivel}: {NIVELES[nivel]}</p>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard value={xp} label="XP Total" color="#3b82f6" />
          <StatCard value={perfil?.racha_actual || 0} label="Racha" color="#fbbf24" suffix="🔥" />
          <StatCard value={nivel} label="Nivel" color="#10b981" />
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-end mb-3 text-[var(--sub)]">
            <span className="text-[10px] font-bold uppercase tracking-widest">Progreso actual</span>
            <span className="text-[10px] font-mono">{xpEnNivel} / 500 XP</span>
          </div>
          <div className="h-2 bg-[var(--bg3)] rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(xpEnNivel / 500) * 100}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULOS.map((m) => {
            const prefix = m.id === 0 ? '00-' : `0${m.id}-`;
            const done = Object.keys(prog).filter(k => k.startsWith(prefix) && prog[k]?.completada).length;
            const pct = Math.round((done / m.lecciones_total) * 100);
            return (
              <div key={m.id} onClick={() => router.push(`/leccion/${m.id}`)} className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl">{m.icono}</span>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)]">{m.titulo}</h4>
                    <p className="text-[10px] text-[var(--sub)]">{m.lecciones_total} lecciones</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-[var(--bg3)] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--sub)]">{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {retoPopup && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[var(--card)] border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <span className="text-5xl block mb-4">⚡</span>
            <h2 className="text-xl font-bold mb-2 text-[var(--text)]">¡Retos listos!</h2>
            <button onClick={() => router.push('/retos')} className="w-full bg-amber-500 text-black py-3 rounded-xl text-sm font-bold mt-4">Ir ahora →</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Pill({ children, color }: { children: React.ReactNode, color: string }) {
  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-full px-3 py-1 flex items-center gap-2 text-[10px] font-bold text-[var(--text)]">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </div>
  )
}

function StatCard({ value, label, color, suffix = "" }: { value: any, label: string, color: string, suffix?: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
      <div className="text-lg font-bold mb-1" style={{ color }}>{value}{suffix}</div>
      <div className="text-[10px] font-bold text-[var(--sub)] uppercase tracking-widest">{label}</div>
    </div>
  )
}
