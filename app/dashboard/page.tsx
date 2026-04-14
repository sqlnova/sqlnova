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
  const [loadError, setLoadError] = useState(false)
  const [retoPopup, setRetoPopup] = useState(false)
  const [tieneRetoHoy, setTieneRetoHoy] = useState(false)
  const [pagoMsg, setPagoMsg] = useState<'exitoso' | 'timeout' | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoadError(false)
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

      document.documentElement.setAttribute('data-theme', p?.tema || 'oscuro')

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

        const popupVisto = localStorage.getItem(`reto_popup_${hoy}`)
        if (!comp && !popupVisto) {
          setRetoPopup(true)
        }
      }
    } catch (e) {
      console.error(e)
      setLoadError(true)
    } finally { setLoading(false) }
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  // Detectar retorno de MercadoPago con guard anti-CSRF vía sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pago') !== 'exitoso') return

    window.history.replaceState({}, '', '/dashboard')

    const verificarPago = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) return

      // Guard: solo procesar si el pago fue iniciado desde esta sesión del navegador
      const flagUid = sessionStorage.getItem('pago_iniciado_uid')
      if (flagUid !== session.user.id) return
      sessionStorage.removeItem('pago_iniciado_uid')

      // Polling con backoff exponencial: 3s, 6s, 12s, 24s, 48s
      const delays = [3000, 6000, 12000, 24000, 48000]
      for (const delay of delays) {
        await new Promise(r => setTimeout(r, delay))
        const { data: p } = await sb.from('perfiles')
          .select('es_premium')
          .eq('id', session.user.id)
          .single()

        if (p?.es_premium) {
          setPagoMsg('exitoso')
          loadData()
          return
        }
      }
      setPagoMsg('timeout')
    }

    verificarPago()
  }, [loadData])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
      <div className="w-8 h-8 border-2 border-[var(--border2)] border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  if (loadError) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] gap-4 p-6">
      <div className="text-3xl">⚠️</div>
      <p className="text-[var(--text)] font-bold">No se pudieron cargar tus datos</p>
      <p className="text-[var(--sub)] text-sm text-center">Verificá tu conexión a internet e intentá de nuevo.</p>
      <button
        onClick={() => { setLoading(true); loadData() }}
        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
      >
        Reintentar
      </button>
    </div>
  )

  const xp = perfil?.xp_total || 0
  const nivel = Math.min(Math.floor(xp / 500) + 1, NIVELES.length - 1)
  const xpEnNivel = xp % 500
  const nombre = perfil?.nombre || 'Amigo'
  const iniciales = nombre.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const esPremium = perfil?.es_premium === true

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <nav className="h-[52px] border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md sticky top-0 z-[100] px-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tighter text-[var(--text)]">SQL<span className="text-blue-500">Nova</span></div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/leaderboard')} className="p-1.5 rounded-lg border bg-[var(--bg3)] border-[var(--border)] text-[var(--sub)] text-xs font-bold">
            🏆
          </button>
          
          <button onClick={() => router.push('/retos')} className={`p-1.5 rounded-lg border ${tieneRetoHoy ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-[var(--bg3)] border-[var(--border)] text-[var(--sub)]'} text-xs font-bold`}>
            ⚡ {tieneRetoHoy && "!"}
          </button>
          
          <Pill color="#fbbf24">{perfil?.racha_actual || 0}🔥</Pill>
          <Pill color="#3b82f6">{xp}⚡</Pill>

          <div className="relative">
            <div onClick={() => setDropOpen(!dropOpen)} className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center cursor-pointer ml-1">
              {iniciales}
            </div>
            {dropOpen && (
              <div className="absolute right-0 top-10 bg-[var(--card)] border border-[var(--border2)] rounded-xl p-2 min-w-[180px] shadow-2xl">
                <div className="px-3 py-2 text-xs font-bold border-b border-[var(--border)] mb-1 flex items-center gap-2 text-[var(--text)]">
                  {nombre} {esPremium && "💎"}
                </div>
                <div onClick={() => router.push('/leaderboard')} className="px-3 py-2 text-xs hover:bg-[var(--bg3)] rounded-lg cursor-pointer text-[var(--text)] font-bold">🏆 Ranking</div>
                <div onClick={() => router.push('/pocket')} className="px-3 py-2 text-xs hover:bg-[var(--bg3)] rounded-lg cursor-pointer text-blue-500 font-bold">🗄️ Pocket Database</div>
                <div onClick={() => router.push('/perfil')} className="px-3 py-2 text-xs hover:bg-[var(--bg3)] rounded-lg cursor-pointer text-[var(--text)]">⚙️ Mi perfil</div>
                <div onClick={() => sb.auth.signOut().then(() => router.replace('/auth'))} className="px-3 py-2 text-xs hover:bg-red-500/10 text-red-500 rounded-lg cursor-pointer mt-1">Cerrar sesión</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {pagoMsg === 'exitoso' && (
        <div className="bg-green-500/10 border-b border-green-500/20 px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-sm text-green-400 font-bold">✅ ¡Bienvenido a Premium! Ya tenés acceso completo a Pocket Database.</span>
          <button onClick={() => setPagoMsg(null)} className="text-green-600 hover:text-green-400 text-lg leading-none">✕</button>
        </div>
      )}
      {pagoMsg === 'timeout' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-sm text-amber-400 font-bold">⏳ Tu pago fue procesado. Si en unos minutos no tenés acceso, escribinos y lo resolvemos.</span>
          <button onClick={() => setPagoMsg(null)} className="text-amber-600 hover:text-amber-400 text-lg leading-none">✕</button>
        </div>
      )}

      <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Hola, {nombre.split(' ')[0]} 👋</h1>
          <p className="text-[var(--sub)] text-sm">Tu camino al dominio total de SQL.</p>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard value={xp} label="XP Total" color="#3b82f6" />
          <StatCard value={perfil?.racha_actual || 0} label="Racha" color="#fbbf24" suffix="🔥" />
          <StatCard value={nivel} label="Nivel" color="#10b981" />
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-[10px] font-bold text-[var(--sub)] uppercase tracking-widest block mb-1">Tu progreso actual</span>
              <span className="text-sm font-bold text-[var(--text)]">Nivel {nivel}: {NIVELES[nivel]}</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--sub)]">{xpEnNivel} / 500 XP</span>
          </div>
          <div className="h-2 bg-[var(--bg3)] rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(xpEnNivel / 500) * 100}%` }} />
          </div>
        </div>

        <h2 className="text-[10px] font-bold text-[var(--sub)] uppercase tracking-[0.2em] mb-4">Módulos de aprendizaje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {MODULOS.map((m) => {
             const prefix = String(m.id).padStart(2, '0') + '-';
             const done = Object.keys(prog).filter(k => k.startsWith(prefix) && prog[k]?.completada).length;
             const pct = Math.round((done / m.lecciones_total) * 100);
             return (
               <div 
                key={m.id} 
                onClick={() => router.push(`/leccion/${m.id}`)}
                className={`bg-[var(--card)] border ${pct === 100 ? 'border-green-500/20' : 'border-[var(--border)]'} p-5 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all`}
               >
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

        <h2 className="text-[10px] font-bold text-[var(--sub)] uppercase tracking-[0.2em] mb-4">Herramientas Pro</h2>
        <div 
          onClick={() => router.push('/pocket')}
          className={`bg-[var(--card)] border ${esPremium ? 'border-blue-500/30' : 'border-purple-500/20'} rounded-2xl p-6 cursor-pointer hover:bg-[var(--bg3)] transition-all group`}
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
              <p className="text-xs text-[var(--sub)] leading-relaxed max-w-sm">
                Analizá tus propios CSV con SQL localmente. Privacidad total: nada se sube a la nube.
              </p>
            </div>
            <button className="bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all">
              Entrar →
            </button>
          </div>
        </div>
      </div>

      {retoPopup && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-up">
          <div className="bg-[var(--card)] border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <span className="text-5xl block mb-4">⚡</span>
            <h2 className="text-xl font-bold mb-2 text-[var(--text)]">¡Retos diarios listos!</h2>
            <p className="text-sm text-[var(--sub)] mb-8 leading-relaxed">
              ¿Te animás a resolver los desafíos de hoy? Ganá XP extra y subí en el ranking semanal.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setRetoPopup(false);
                  const hoyStr = new Date().toLocaleDateString('sv-SE');
                  localStorage.setItem(`reto_popup_${hoyStr}`, 'true');
                }} 
                className="flex-1 py-3 text-sm text-[var(--sub)] font-bold bg-[var(--bg3)] hover:bg-[var(--border)] rounded-xl transition-all"
              >
                Más tarde
              </button>
              <button 
                onClick={() => router.push('/retos')} 
                className="flex-[2] bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
              >
                ¡Quiero el reto!
              </button>
            </div>
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
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 lg:p-5">
      <div className="text-lg lg:text-xl font-bold mb-1" style={{ color }}>{value}{suffix}</div>
      <div className="text-[10px] font-bold text-[var(--sub)] uppercase tracking-widest">{label}</div>
    </div>
  )
}
