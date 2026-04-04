'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { LECCIONES_M1, LECCIONES_M2, INTRO_SLIDES, DATASET_SQL } from '@/lib/curriculum'

type Prog = Record<string, { completada: boolean; xp_ganado: number }>

export default function LeccionClient({ moduloId }: { moduloId: number }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [prog, setProg] = useState<Prog>({})
  const [curIdx, setCurIdx] = useState(0)
  const [curSlide, setCurSlide] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [justAnswered, setJustAnswered] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [dataOpen, setDataOpen] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [blanks, setBlanks] = useState<string[]>([])
  const [result, setResult] = useState<{ columns: string[]; values: any[][] } | null>(null)
  const [resultError, setResultError] = useState('')
  const [loading, setLoading] = useState(true)
  const [rachaAnimate, setRachaAnimate] = useState(false)
  const sqlDbRef = useRef<any>(null)

  const getLecciones = () => {
    if (moduloId === 1) return LECCIONES_M1
    if (moduloId === 2) return LECCIONES_M2
    return []
  }

  const getModuloLabel = () => {
    if (moduloId === 1) return 'Módulo 1 · SELECT & Básicos'
    if (moduloId === 2) return 'Módulo 2 · WHERE & Filtros'
    return `Módulo ${moduloId}`
  }

  const getPrefix = () => {
    if (moduloId === 1) return '01-'
    if (moduloId === 2) return '02-'
    return `0${moduloId}-`
  }

  useEffect(() => {
    const setup = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      setUser(session.user)

      const { data: p } = await sb.from('perfiles').select('*').eq('id', session.user.id).single()
      setPerfil(p)

      const { data: progData } = await sb.from('progreso').select('*').eq('usuario_id', session.user.id)
      const pm: Prog = {}
      ;(progData || []).forEach((r: any) => { pm[r.leccion_id] = r })
      setProg(pm)

      if (moduloId !== 0) {
        let SQL: any
        if ((window as any)._sqljsReady && (window as any)._sqljsInstance) {
          SQL = (window as any)._sqljsInstance
        } else if ((window as any)._sqljsPromise) {
          SQL = await (window as any)._sqljsPromise
        } else {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'
          document.head.appendChild(script)
          await new Promise(resolve => { script.onload = resolve })
          SQL = await (window as any).initSqlJs({
            locateFile: (f: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
          })
        }
        const db = new SQL.Database()
        db.run(DATASET_SQL)
        sqlDbRef.current = db
      }

      const lecciones = getLecciones()
      if (lecciones.length > 0) {
        const prefix = getPrefix()
        const done = Object.keys(pm).filter(k => k.startsWith(prefix) && pm[k]?.completada).length
        setCurIdx(Math.min(done, lecciones.length - 1))
      }

      setLoading(false)
    }
    setup()
  }, [moduloId, router])

  useEffect(() => {
    setAnswered(false)
    setJustAnswered(false)
    setHintOpen(false)
    setDataOpen(false)
    setResult(null)
    setResultError('')
    setQueryText('')
    setRachaAnimate(false)
    const lecciones = getLecciones()
    if (lecciones.length > 0 && lecciones[curIdx]) {
      const l = lecciones[curIdx]
      setBlanks(l.blanks ? l.blanks.map(() => '') : [])
      if (l.tipo === 'debugging' && l.errorQuery) setQueryText(l.errorQuery)
      if (prog[l.id]?.completada) setAnswered(true)
    }
  }, [curIdx, curSlide, moduloId, prog])

  const saveProg = async (lid: string, mid: number, xp: number, pistaUsada: boolean) => {
    await sb.from('progreso').upsert({
      usuario_id: user.id, leccion_id: lid, modulo_id: mid,
      completada: true, xp_ganado: xp, pista_usada: pistaUsada,
      completada_en: new Date().toISOString()
    }, { onConflict: 'usuario_id,leccion_id' })

    const { data, error } = await sb.rpc('actualizar_racha', {
      p_usuario_id: user.id,
      p_xp: xp
    })

    if (!error && data) {
      const resultado = data as { racha_actual: number; racha_maxima: number; xp_total: number }
      const rachaSubio = resultado.racha_actual > (perfil?.racha_actual || 0)
      setPerfil((prev: any) => ({
        ...prev,
        xp_total: resultado.xp_total,
        racha_actual: resultado.racha_actual,
        racha_maxima: resultado.racha_maxima,
        ultima_actividad: new Date().toISOString().split('T')[0],
      }))
      if (rachaSubio) setRachaAnimate(true)
    }

    setProg(prev => ({ ...prev, [lid]: { completada: true, xp_ganado: xp } }))
  }

  const getQuery = () => {
    const lecciones = getLecciones()
    const l = lecciones[curIdx]
    if (l.tipo === 'completar' && l.template && l.blanks) {
      let q = l.template
      blanks.forEach(b => { q = q.replace('___', b) })
      return q
    }
    return queryText
  }

  const normalize = (q: string) => q.replace(/;$/, '').replace(/\s+/g, ' ').trim().toUpperCase()

  const runQuery = async () => {
    const lecciones = getLecciones()
    const l = lecciones[curIdx]
    const q = getQuery().trim()
    if (!q || !sqlDbRef.current) return

    try {
      const res = sqlDbRef.current.exec(q)
      if (!res.length) { setResult({ columns: [], values: [] }); setResultError(''); return }
      setResult(res[0])
      setResultError('')

      if (!answered) {
        const solRes = sqlDbRef.current.exec(l.solucion)
        if (!solRes.length) return
        const uRows = JSON.stringify(res[0].values)
        const sRows = JSON.stringify(solRes[0].values)
        const uCols = JSON.stringify(res[0].columns.map((c: string) => c.toLowerCase()))
        const sCols = JSON.stringify(solRes[0].columns.map((c: string) => c.toLowerCase()))
        const exact = uRows === sRows && uCols === sCols
        const normMatch = normalize(q) === normalize(l.solucion)

        if (exact || normMatch) {
          setAnswered(true)
          setJustAnswered(true)
          if (!prog[l.id]?.completada) {
            await saveProg(l.id, moduloId, l.xp, hintOpen)
          }
        }
      }
    } catch (e: any) {
      setResultError(e.message)
      setResult(null)
    }
  }

  const nextLesson = () => {
    const lecciones = getLecciones()
    if (curIdx < lecciones.length - 1) {
      setCurIdx(prev => prev + 1)
      window.scrollTo(0, 0)
    } else {
      router.replace('/dashboard')
    }
  }

  const finishIntro = async () => {
    const slides = INTRO_SLIDES.map(s => s.id)
    for (const sid of slides) {
      if (!prog[sid]?.completada) {
        await saveProg(sid, 0, 5, false)
      }
    }
    router.replace('/leccion/1')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--sub)' }}>{moduloId !== 0 ? 'Cargando motor SQL...' : 'Cargando...'}</div>
      </div>
    </div>
  )

  // ── MÓDULO 0: INTRODUCCIÓN ──
  if (moduloId === 0) {
    const slide = INTRO_SLIDES[curSlide]
    const total = INTRO_SLIDES.length
    const pct = Math.round(((curSlide + 1) / total) * 100)
    const isLast = curSlide === total - 1

    const TABLA_ROWS = [
      [1, 'Ana García', 28, 'Buenos Aires'],
      [2, 'Luis Pérez', 34, 'Córdoba'],
      [3, 'María López', 22, 'Rosario'],
      [4, 'Carlos Ruiz', 41, 'Mendoza'],
    ]
    const TABLA_COLS = ['id', 'nombre', 'edad', 'ciudad']

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title={slide.titulo} module="Módulo 0 · Introducción" prog={`${curSlide + 1} / ${total}`} onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: '28px 20px', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 0' }}>

              {/* Apps grid */}
              {slide.tipo === 'apps' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                  {[['🏦','Bancos','Movimientos y saldos'],['🛒','Tiendas online','Productos y pedidos'],['📱','Redes sociales','Perfiles y posts'],['🏥','Hospitales','Historias clínicas']].map(([ico,n,d]) => (
                    <div key={n} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{ico}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>{n}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{d}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* DER visual */}
              {slide.tipo === 'der' && (
                <div style={{ marginBottom: 16 }}>
                  <svg viewBox="0 0 560 220" style={{ width: '100%', height: 'auto' }} xmlns="http://www.w3.org/2000/svg">
                    {/* Tabla clientes */}
                    <rect x="10" y="20" width="150" height="160" rx="8" fill="rgba(77,166,255,0.07)" stroke="rgba(77,166,255,0.4)" strokeWidth="1.5"/>
                    <rect x="10" y="20" width="150" height="32" rx="8" fill="rgba(77,166,255,0.2)"/>
                    <rect x="10" y="44" width="150" height="8" rx="0" fill="rgba(77,166,255,0.2)"/>
                    <text x="85" y="41" textAnchor="middle" fill="#4da6ff" fontSize="12" fontWeight="700" fontFamily="monospace">clientes</text>
                    <text x="24" y="72" fill="#a0b4cc" fontSize="10" fontFamily="monospace">🔑 id</text>
                    <text x="24" y="90" fill="#c8d8e8" fontSize="10" fontFamily="monospace">nombre</text>
                    <text x="24" y="108" fill="#c8d8e8" fontSize="10" fontFamily="monospace">email</text>
                    <text x="24" y="126" fill="#c8d8e8" fontSize="10" fontFamily="monospace">ciudad</text>
                    <text x="24" y="144" fill="#c8d8e8" fontSize="10" fontFamily="monospace">telefono</text>

                    {/* Tabla pedidos (centro) */}
                    <rect x="200" y="20" width="160" height="180" rx="8" fill="rgba(62,207,142,0.07)" stroke="rgba(62,207,142,0.4)" strokeWidth="1.5"/>
                    <rect x="200" y="20" width="160" height="32" rx="8" fill="rgba(62,207,142,0.2)"/>
                    <rect x="200" y="44" width="160" height="8" rx="0" fill="rgba(62,207,142,0.2)"/>
                    <text x="280" y="41" textAnchor="middle" fill="#3ecf8e" fontSize="12" fontWeight="700" fontFamily="monospace">pedidos</text>
                    <text x="214" y="72" fill="#a0b4cc" fontSize="10" fontFamily="monospace">🔑 id</text>
                    <text x="214" y="90" fill="#f0a050" fontSize="10" fontFamily="monospace">🔗 cliente_id</text>
                    <text x="214" y="108" fill="#f0a050" fontSize="10" fontFamily="monospace">🔗 producto_id</text>
                    <text x="214" y="126" fill="#c8d8e8" fontSize="10" fontFamily="monospace">fecha</text>
                    <text x="214" y="144" fill="#c8d8e8" fontSize="10" fontFamily="monospace">total</text>
                    <text x="214" y="162" fill="#c8d8e8" fontSize="10" fontFamily="monospace">estado</text>

                    {/* Tabla productos */}
                    <rect x="400" y="20" width="150" height="160" rx="8" fill="rgba(232,168,56,0.07)" stroke="rgba(232,168,56,0.4)" strokeWidth="1.5"/>
                    <rect x="400" y="20" width="150" height="32" rx="8" fill="rgba(232,168,56,0.2)"/>
                    <rect x="400" y="44" width="150" height="8" rx="0" fill="rgba(232,168,56,0.2)"/>
                    <text x="475" y="41" textAnchor="middle" fill="#e8a838" fontSize="12" fontWeight="700" fontFamily="monospace">productos</text>
                    <text x="414" y="72" fill="#a0b4cc" fontSize="10" fontFamily="monospace">🔑 id</text>
                    <text x="414" y="90" fill="#c8d8e8" fontSize="10" fontFamily="monospace">nombre</text>
                    <text x="414" y="108" fill="#c8d8e8" fontSize="10" fontFamily="monospace">precio</text>
                    <text x="414" y="126" fill="#c8d8e8" fontSize="10" fontFamily="monospace">categoria</text>
                    <text x="414" y="144" fill="#c8d8e8" fontSize="10" fontFamily="monospace">stock</text>

                    {/* Flecha clientes → pedidos */}
                    <line x1="160" y1="90" x2="200" y2="90" stroke="rgba(240,160,80,0.7)" strokeWidth="1.5" strokeDasharray="4,3"/>
                    <polygon points="196,86 204,90 196,94" fill="rgba(240,160,80,0.7)"/>

                    {/* Flecha productos → pedidos */}
                    <line x1="400" y1="108" x2="360" y2="108" stroke="rgba(240,160,80,0.7)" strokeWidth="1.5" strokeDasharray="4,3"/>
                    <polygon points="364,104 356,108 364,112" fill="rgba(240,160,80,0.7)"/>

                    {/* Label relaciones */}
                    <text x="178" y="83" textAnchor="middle" fill="rgba(240,160,80,0.9)" fontSize="8" fontFamily="monospace">1:N</text>
                    <text x="382" y="101" textAnchor="middle" fill="rgba(240,160,80,0.9)" fontSize="8" fontFamily="monospace">N:1</text>
                  </svg>
                </div>
              )}

              {/* Tabla highlight */}
              {slide.tipo === 'tabla' && (
                <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.76rem' }}>
                    <thead>
                      <tr>{TABLA_COLS.map(c => (
                        <th key={c} style={{ padding: '7px 10px', border: '1px solid var(--border)', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: (slide as any).hlCols ? 'rgba(77,166,255,0.18)' : 'var(--bg3)', color: (slide as any).hlCols ? '#7dd3fc' : 'var(--sub)', transition: 'all .3s' }}>{c}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {TABLA_ROWS.map((row, ri) => (
                        <tr key={ri}>{row.map((v, ci) => (
                          <td key={ci} style={{ padding: '6px 10px', border: '1px solid var(--border)', background: ri === (slide as any).hlRow ? 'rgba(62,207,142,0.1)' : 'rgba(255,255,255,0.01)', color: ri === (slide as any).hlRow ? '#6ee7b7' : 'var(--text)', fontWeight: ri === (slide as any).hlRow ? 600 : 400, transition: 'all .3s' }}>{String(v)}</td>
                        ))}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SQL slide */}
              {slide.tipo === 'sql' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      ['📊', 'Analistas de datos', 'Extraen insights de millones de filas'],
                      ['💻', 'Developers', 'Construyen apps que leen y guardan datos'],
                      ['🔬', 'Data Scientists', 'Preparan datos para modelos de IA'],
                      ['📈', 'Product Managers', 'Consultan métricas y KPIs del negocio'],
                    ].map(([ico, title, desc]) => (
                      <div key={title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{ico}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#0b0d14', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontFamily: 'DM Mono', fontSize: '0.8rem', lineHeight: 1.8 }}>
                    <span style={{ color: '#93c5fd' }}>SELECT</span>
                    <span style={{ color: '#e2e8f0' }}> nombre, salario </span>
                    <span style={{ color: '#93c5fd' }}>FROM</span>
                    <span style={{ color: '#a78bfa' }}> empleados </span>
                    <span style={{ color: '#93c5fd' }}>WHERE</span>
                    <span style={{ color: '#e2e8f0' }}> salario </span>
                    <span style={{ color: '#6ee7b7' }}>&gt; </span>
                    <span style={{ color: '#fbbf24' }}>80000</span>
                    <span style={{ color: '#64748b' }}>; </span>
                    <span style={{ color: '#475569', fontSize: '0.72rem' }}>-- Dame nombre y salario de empleados que ganen más de $80k</span>
                  </div>
                </div>
              )}

              {/* Resumen final */}
              {slide.tipo === 'resumen' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    ['🗄️','Base de datos','Contiene todas las tablas','var(--amber)'],
                    ['📋','Tabla','Filas y columnas del mismo tipo','var(--nova)'],
                    ['⬇️','Columna','Define qué tipo de dato se guarda','var(--green)'],
                    ['➡️','Fila','Un registro completo de datos','#f472b6'],
                    ['🔗','Relación','Las tablas se conectan entre sí','#a78bfa'],
                    ['💬','SQL','El lenguaje para consultar todo','#22d3ee'],
                  ].map(([ico,t,d,c]) => (
                    <div key={t} style={{ background: 'var(--bg2)', border: `1px solid ${c}30`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: '1.3rem', flexShrink: 0 }}>{ico}</div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: c, marginBottom: 2 }}>{t}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SVG genérico (slide 1) */}
              {slide.tipo === 'svg' && (
                <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 20, marginBottom: 16, textAlign: 'center' }}>
                  <svg viewBox="0 0 200 100" style={{ width: '100%', maxWidth: 280, height: 'auto' }} xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="10" width="180" height="80" rx="10" fill="rgba(77,166,255,0.07)" stroke="rgba(77,166,255,0.3)" strokeWidth="1.5"/>
                    <rect x="20" y="20" width="75" height="60" rx="6" fill="rgba(77,166,255,0.1)" stroke="rgba(77,166,255,0.25)" strokeWidth="1"/>
                    <text x="57" y="54" textAnchor="middle" fill="#4da6ff" fontSize="9" fontFamily="monospace">clientes</text>
                    <rect x="105" y="20" width="75" height="60" rx="6" fill="rgba(62,207,142,0.1)" stroke="rgba(62,207,142,0.25)" strokeWidth="1"/>
                    <text x="142" y="54" textAnchor="middle" fill="#3ecf8e" fontSize="9" fontFamily="monospace">productos</text>
                    <text x="100" y="96" textAnchor="middle" fill="rgba(77,166,255,0.5)" fontSize="7" fontFamily="monospace">Base de datos</text>
                  </svg>
                  <div style={{ fontSize: '0.85rem', color: 'var(--sub)', marginTop: 8 }}>Una colección organizada de tablas relacionadas</div>
                </div>
              )}
            </div>

            {/* Subtítulo y navegación */}
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ fontSize: '0.92rem', color: '#c8d8f0', lineHeight: 1.75, background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.5)', borderRadius: '0 10px 10px 0', padding: '14px 16px', marginBottom: 18 }}>
                {slide.subtitulo}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {curSlide > 0 && (
                  <button onClick={() => setCurSlide(s => s - 1)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '9px 16px', color: 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>← Anterior</button>
                )}
                <button
                  onClick={isLast ? finishIntro : () => setCurSlide(s => s + 1)}
                  style={{ background: isLast ? 'var(--green)' : 'var(--nova2)', color: isLast ? '#0a2417' : '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isLast ? 'Empezar Módulo 1 →' : 'Siguiente →'}
                </button>
                <div style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
                  {INTRO_SLIDES.map((_, i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === curSlide ? 'var(--nova)' : 'var(--bg3)', transition: 'background .3s' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <BottomBar label={`Slide ${curSlide + 1} de ${total}`} pct={pct} />
      </div>
    )
  }

  // ── MÓDULOS NO DISPONIBLES ──
  if (moduloId !== 1 && moduloId !== 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '2rem' }}>🚧</div>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Módulo próximamente disponible</div>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>← Volver al dashboard</button>
      </div>
    )
  }

  // ── MÓDULOS 1 y 2 ──
  const lecciones = getLecciones()
  const l = lecciones[curIdx]
  const total = lecciones.length
  const pct = Math.round(((curIdx + 1) / total) * 100)

  const PREVIEW: Record<string, { cols: string[]; rows: any[][] }> = {
    peliculas: {
      cols: ['id', 'titulo', 'genero', 'anio', 'calificacion'],
      rows: [[1,'Galaxia Perdida','Ciencia Ficción',2021,8.3],[2,'El Último Tango','Drama',2019,7.1],[3,'Risa Sin Fin','Comedia',2022,6.5]]
    },
    series: {
      cols: ['id', 'titulo', 'genero', 'temporadas', 'calificacion'],
      rows: [[1,'El Imperio Caído','Drama',4,9.2],[2,'Detectives del Sur','Crimen',2,8.0]]
    },
    empleados: {
      cols: ['id', 'nombre', 'departamento', 'salario', 'email'],
      rows: [
        [1,'Ana García','Ventas',72000,'ana@empresa.com'],
        [2,'Luis Pérez','Sistemas',95000,'luis@empresa.com'],
        [3,'María López','Marketing',68000,'maria@empresa.com'],
      ]
    },
  }

  const pv = PREVIEW[l.tabla] || PREVIEW.peliculas
  const badgeColor = { escribir: 'var(--green)', completar: 'var(--nova)', debugging: 'var(--amber)' }[l.tipo]
  const badgeBg = { escribir: 'rgba(62,207,142,0.09)', completar: 'rgba(77,166,255,0.09)', debugging: 'rgba(232,168,56,0.09)' }[l.tipo]
  const badgeLabel = { escribir: 'Escribir desde cero', completar: 'Completar el query', debugging: 'Debugging' }[l.tipo]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <TopBar title={l.titulo} module={getModuloLabel()} prog={`${curIdx + 1} / ${total}`} onBack={() => router.replace('/dashboard')} />

      <div style={{ flex: 1, padding: '26px 20px', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>

        {/* Banner racha */}
        {rachaAnimate && (
          <div style={{ background: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeUp 0.3s ease both' }}>
            <span style={{ fontSize: '1.4rem' }}>🔥</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--amber)' }}>¡Racha activa! {perfil?.racha_actual} día{perfil?.racha_actual !== 1 ? 's' : ''} seguido{perfil?.racha_actual !== 1 ? 's' : ''}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sub)' }}>Volvé mañana para seguir la racha 💪</div>
            </div>
          </div>
        )}

        {/* Teoría — mejorada visualmente */}
        <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 18, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: l.teoria }} />

        {/* Tarjeta ejercicio */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '13px 17px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 5, background: badgeBg, color: badgeColor }}>{badgeLabel}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--sub)', marginLeft: 'auto' }}>+<strong style={{ color: 'var(--green)' }}>{l.xp}</strong> XP</span>
          </div>

          <div style={{ padding: '18px 17px' }}>
            {/* Enunciado */}
            <div style={{ fontSize: '0.97rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.6, marginBottom: 15, color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: l.enunciado.replace(/\n/g, '<br/>') }} />

            {/* Dataset toggle */}
            <div onClick={() => setDataOpen(!dataOpen)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: 'var(--sub)', cursor: 'pointer', marginBottom: 12, padding: '4px 9px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7 }}>
              📋 Ver tabla: <strong style={{ color: 'var(--nova)' }}>{l.tabla}</strong> {dataOpen ? '▴' : '▾'}
            </div>

            {dataOpen && (
              <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.72rem' }}>
                  <thead><tr>{pv.cols.map(c => <th key={c} style={{ padding: '6px 9px', border: '1px solid var(--border)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg3)', color: 'var(--sub)' }}>{c}</th>)}</tr></thead>
                  <tbody>
                    {pv.rows.map((row, ri) => <tr key={ri}>{row.map((v, ci) => <td key={ci} style={{ padding: '5px 9px', border: '1px solid var(--border)' }}>{String(v)}</td>)}</tr>)}
                    <tr><td colSpan={pv.cols.length} style={{ padding: '5px 9px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--dim)', fontSize: '0.68rem' }}>… más filas</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Editor completar */}
            {l.tipo === 'completar' && l.template && l.blanks ? (
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.88rem', lineHeight: 2.4, padding: '13px 15px', background: '#0b0d14', border: '1px solid var(--border2)', borderRadius: 11, marginBottom: 13 }}>
                {l.template.split('___').map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < (l.blanks?.length || 0) && (
                      <input
                        value={blanks[i] || ''}
                        onChange={e => { const nb = [...blanks]; nb[i] = e.target.value; setBlanks(nb) }}
                        placeholder="..."
                        style={{ background: 'rgba(77,166,255,0.08)', border: '1px dashed rgba(77,166,255,0.32)', borderRadius: 5, color: 'var(--nova)', fontFamily: 'DM Mono', fontSize: '0.85rem', padding: '2px 7px', minWidth: 68, outline: 'none' }}
                      />
                    )}
                  </span>
                ))}
              </div>
            ) : (
              /* Editor escribir / debugging */
              <div style={{ background: '#0b0d14', border: '1px solid var(--border2)', borderRadius: 11, overflow: 'hidden', marginBottom: 13 }}>
                <div style={{ background: '#0e1018', padding: '6px 11px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid var(--border)' }}>
                  {['#ff5f57','#ffbd2e','#28c840'].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
                  <span style={{ fontFamily: 'DM Mono', fontSize: '0.61rem', color: 'var(--dim)', marginLeft: 4 }}>query.sql</span>
                </div>
                <textarea
                  className="sql-editor"
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery() } }}
                />
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={runQuery} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem' }}>▶ Ejecutar</button>
              <button onClick={() => setHintOpen(!hintOpen)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 15px', color: hintOpen ? 'var(--amber)' : 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>💡 Pista</button>
              {answered && (
                <button onClick={nextLesson} style={{ background: 'var(--green)', color: '#0a2417', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem' }}>
                  {curIdx < lecciones.length - 1 ? 'Siguiente →' : '🏆 Finalizar módulo'}
                </button>
              )}
            </div>

            {/* Pista */}
            {hintOpen && (
              <div style={{ marginTop: 11, background: 'rgba(232,168,56,0.045)', border: '1px solid rgba(232,168,56,0.16)', borderRadius: 9, padding: '11px 14px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--amber)', marginBottom: 4 }}>Pista</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--sub)' }}>{l.pista}</div>
              </div>
            )}

            {/* Resultado */}
            {(result || resultError) && (
              <div style={{ marginTop: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                  <span style={{ fontSize: '0.77rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: resultError ? 'rgba(229,83,75,0.09)' : 'rgba(62,207,142,0.09)', color: resultError ? 'var(--red)' : 'var(--green)', border: `1px solid ${resultError ? 'rgba(229,83,75,0.22)' : 'rgba(62,207,142,0.22)'}` }}>
                    {resultError ? '✗ Error en el query' : '✓ Query ejecutado'}
                  </span>
                  {result && !resultError && <span style={{ fontSize: '0.71rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{result.values.length} fila{result.values.length !== 1 ? 's' : ''}</span>}
                </div>
                {resultError ? (
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.79rem', color: 'var(--red)', background: 'rgba(229,83,75,0.05)', border: '1px solid rgba(229,83,75,0.16)', borderRadius: 8, padding: '9px 13px' }}>{resultError}</div>
                ) : result && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.74rem' }}>
                      <thead><tr>{result.columns.map(c => <th key={c} style={{ padding: '6px 9px', border: '1px solid var(--border)', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg3)', color: 'var(--nova)' }}>{c}</th>)}</tr></thead>
                      <tbody>{result.values.map((row, ri) => <tr key={ri}>{row.map((v, ci) => <td key={ci} style={{ padding: '5px 9px', border: '1px solid var(--border)' }}>{v !== null ? String(v) : <span style={{ color: 'var(--dim)' }}>NULL</span>}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Éxito — solo se muestra si acaba de responder bien O si ya estaba completada y no hay resultado nuevo */}
            {answered && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 15, background: 'rgba(62,207,142,0.05)', border: '1px solid rgba(62,207,142,0.18)', borderRadius: 12, padding: '15px 17px' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--green)', marginBottom: 2 }}>¡Correcto!</div>
                  <div style={{ fontSize: '0.79rem', color: 'var(--sub)' }}>
                    {!justAnswered && !result ? 'Ya habías completado esta lección.' : '¡Excelente! Tu respuesta es correcta.'}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: 'DM Mono', fontWeight: 700, fontSize: '1rem', color: 'var(--green)' }}>+{l.xp} XP</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomBar label={`Lección ${curIdx + 1} de ${total}`} pct={pct} />
    </div>
  )
}

function TopBar({ title, module: mod, prog, onBack }: { title: string; module: string; prog: string; onBack: () => void }) {
  return (
    <div style={{ background: 'rgba(8,9,13,0.88)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', padding: '0 20px', height: 50, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 12px', color: 'var(--sub)', fontSize: '0.81rem', fontWeight: 500, cursor: 'pointer' }}>← Volver</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--nova)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{mod}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</div>
      </div>
      <div style={{ fontSize: '0.76rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{prog}</div>
    </div>
  )
}

function BottomBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ background: 'rgba(8,9,13,0.9)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(8px)', padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{ fontSize: '0.74rem', color: 'var(--sub)', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ flex: 1, height: 3, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div className="level-fill" style={{ height: '100%', borderRadius: 3, width: `${pct}%` }} />
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--nova)', fontFamily: 'DM Mono' }}>{pct}%</div>
    </div>
  )
}
