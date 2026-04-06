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
      
      if (!p) {
        const { data: newProfile } = await sb.from('perfiles')
          .insert({
            id: uid,
            nombre: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
            email: session.user.email,
          }).select().single()
        p = newProfile
      }
      setPerfil(p)

      // --- CORRECCIÓN DE TEMA ---
      // Si el tema en Supabase es "claro", activamos el modo claro en toda la web
      if (p?.tema === 'claro') {
        document.documentElement.classList.add('light-mode')
      } else {
        document.documentElement.classList.remove('light-mode')
      }

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
        const { data: comp } = await sb.from('retos_completados').select('reto_id').eq('usuario_id', uid).eq('reto_id', retoId).maybeSingle()
        setTieneRetoHoy(true)
        if (!comp) setRetoPopup(true)
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  const xp = perfil?.xp_total || 0
  const nivel = Math.min(Math.floor(xp / 500) + 1, NIVELES.length - 1)
  const xpEnNivel = xp % 500
  const nombre = perfil?.nombre || 'Amigo'
  const iniciales = nombre.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const esPremium = (perfil as any)?.es_premium || false

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* NAV */}
      <nav className="h-[52px] border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-[100] px-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tighter">SQL<span className="text-blue-500">Nova</span></div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/retos')} className={`p-1.5 rounded-lg border ${tieneRetoHoy ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-slate-400'} text-xs font-bold`}>
            ⚡ {tieneRetoHoy && "!"}
          </button>
          
          <Pill color="#fbbf24">{perfil?.racha_actual || 0}🔥</Pill>
          <Pill color="#3b82f6">{xp}⚡</Pill>

          <div className="relative">
            <div onClick={() => setDropOpen(!dropOpen)} className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center cursor-pointer ml-1">
              {iniciales}
            </div>
            {dropOpen && (
              <div className="absolute right-0 top-10 bg-[var(--card)] border border-white/10 rounded-xl p-2 min-w-[180px] shadow-2xl">
                <div className="px-3 py-2 text-xs font-bold border-b border-white/5 mb-1 flex items-center gap-2 text-[var(--text)]">
                  {nombre} {esPremium && "💎"}
                </div>
                <div onClick={() => router.push('/pocket')} className="px-3 py-2 text-xs hover:bg-white/5 rounded-lg cursor-pointer text-blue-400 font-bold">🗄️ Pocket Database</div>
                <div onClick={() => router.push('/perfil')} className="px-3 py-2 text-xs hover:bg-white/5 rounded-lg cursor-pointer text-[var(--text)]">⚙️ Mi perfil</div>
                <div onClick={() => sb.auth.signOut().then(() => router.replace('/auth'))} className="px-3 py-2 text-xs hover:bg-red-500/10 text-red-500 rounded-lg cursor-pointer mt-1">Cerrar sesión</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Hola, {nombre.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm">Tu camino al dominio total de SQL.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard value={xp} label="XP Total" color="#3b82f6" />
          <StatCard value={perfil?.racha_actual || 0} label="Racha" color="#fbbf24" suffix="🔥" />
          <StatCard value={nivel} label="Nivel" color="#10b981" />
        </div>

        {/* Progress Bar */}
        <div className="bg-[var(--card)] border border-white/5 rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Tu progreso actual</span>
              <span className="text-sm font-bold text-[var(--text)]">Nivel {nivel}: {NIVELES[nivel]}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{xpEnNivel} / 500 XP</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(xpEnNivel / 500) * 100}%` }} />
          </div>
        </div>

        {/* Curriculum Grid */}
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Módulos de aprendizaje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {MODULOS.map((m, i) => {
             const prefix = m.id === 0 ? '00-' : `0${m.id}-`;
             const done = Object.keys(prog).filter(k => k.startsWith(prefix) && prog[k]?.completada).length;
             const pct = Math.round((done / m.lecciones_total) * 100);
             const locked = i > 1 && Object.keys(prog).length < i * 5;
             return (
               <div 
                key={m.id} 
                onClick={() => !locked && router.push(`/leccion/${m.id}`)}
                className={`bg-[var(--card)] border ${pct === 100 ? 'border-green-500/20' : 'border-white/5'} p-5 rounded-2xl cursor-pointer hover:border-white/20 transition-all ${locked && 'opacity-40 cursor-default'}`}
               >
                 <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl">{m.icono}</span>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)]">{m.titulo}</h4>
                      <p className="text-[10px] text-slate-500">{m.lecciones_total} lecciones</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{pct}%</span>
                 </div>
               </div>
             )
          })}
        </div>

        {/* PREMIUM SECTION */}
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Herramientas Pro</h2>
        <div 
          onClick={() => router.push('/pocket')}
          className={`bg-[var(--card)] border ${esPremium ? 'border-blue-500/30' : 'border-purple-500/20'} rounded-2xl p-6 cursor-pointer hover:bg-white/[0.02] transition-all group`}
        >
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${esPremium ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
              🗄️
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <h3 className="font-bold text-base text-[var(--text)]">Pocket Database</h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${esPremium ? 'bg-blue-500 text-white' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                  {esPremium ? 'ACTIVO ✨' : 'NUEVO'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Analizá tus propios CSV con SQL localmente. Privacidad total: nada se sube a la nube.
              </p>
            </div>
            <button className="bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all">
              Entrar →
            </button>
          </div>
        </div>
      </div>

      {/* Popup de Retos */}
      {retoPopup && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[var(--card)] border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <span className="text-5xl block mb-4">⚡</span>
            <h2 className="text-xl font-bold mb-2 text-[var(--text)]">¡Retos listos!</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">Completá los desafíos diarios para ganar XP extra y subir en el ranking semanal.</p>
            <div className="flex gap-3">
              <button onClick={() => setRetoPopup(false)} className="flex-1 py-3 text-sm text-slate-500 font-bold">Luego</button>
              <button onClick={() => router.push('/retos')} className="flex-[2] bg-amber-500 text-black py-3 rounded-xl text-sm font-bold">Ir ahora →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Pill({ children, color }: { children: React.ReactNode, color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 text-[10px] font-bold text-slate-400">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </div>
  )
}

function StatCard({ value, label, color, suffix = "" }: { value: any, label: string, color: string, suffix?: string }) {
  return (
    <div className="bg-[var(--card)] border border-white/5 rounded-2xl p-4 lg:p-5">
      <div className="text-lg lg:text-xl font-bold mb-1" style={{ color }}>{value}{suffix}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  )
}
