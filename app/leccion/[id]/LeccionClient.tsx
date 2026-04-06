'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import {
  LECCIONES_M1, LECCIONES_M2, LECCIONES_M3, LECCIONES_M4,
  INTRO_SLIDES, DATASET_SQL,
  GLOSARIO_M1, GLOSARIO_M2, GLOSARIO_M3, GLOSARIO_M4,
  RESUMEN_M1, RESUMEN_M2, RESUMEN_M3, RESUMEN_M4,
} from '@/lib/curriculum'
import {
  LECCIONES_M5, LECCIONES_M6,
  GLOSARIO_M5, GLOSARIO_M6,
  RESUMEN_M5, RESUMEN_M6,
} from '@/lib/curriculum-m5m6'
import {
  LECCIONES_M7, LECCIONES_M8,
  GLOSARIO_M7, GLOSARIO_M8,
  RESUMEN_M7, RESUMEN_M8,
} from '@/lib/curriculum-m7m8'
import {
  LECCIONES_M9, LECCIONES_M10,
  GLOSARIO_M9, GLOSARIO_M10,
  RESUMEN_M9, RESUMEN_M10,
} from '@/lib/curriculum-m9m10'

type Prog = Record<string, { completada: boolean; xp_ganado: number }>
type Vista = 
  | 'leccion' 
  | 'resumen' 
  | 'glosario' 
  | 'intro-joins' 
  | 'intro-windows' 
  | 'intro-subqueries' 
  | 'intro-ctes'

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
  const [vista, setVista] = useState<Vista>('leccion')
  const [intentos, setIntentos] = useState(0)
  const [glosarioSearch, setGlosarioSearch] = useState('')
  const sqlDbRef = useRef<any>(null)

  const getLecciones = () => {
    if (moduloId === 1) return LECCIONES_M1
    if (moduloId === 2) return LECCIONES_M2
    if (moduloId === 3) return LECCIONES_M3
    if (moduloId === 4) return LECCIONES_M4
    if (moduloId === 5) return LECCIONES_M5
    if (moduloId === 6) return LECCIONES_M6
    if (moduloId === 7) return LECCIONES_M7
    if (moduloId === 8) return LECCIONES_M8
    if (moduloId === 9) return LECCIONES_M9
    if (moduloId === 10) return LECCIONES_M10
    return []
  }

  const getGlosario = () => {
    if (moduloId === 1) return GLOSARIO_M1
    if (moduloId === 2) return GLOSARIO_M2
    if (moduloId === 3) return GLOSARIO_M3
    if (moduloId === 4) return GLOSARIO_M4
    if (moduloId === 5) return GLOSARIO_M5
    if (moduloId === 6) return GLOSARIO_M6
    if (moduloId === 7) return GLOSARIO_M7
    if (moduloId === 8) return GLOSARIO_M8
    if (moduloId === 9) return GLOSARIO_M9
    if (moduloId === 10) return GLOSARIO_M10
    return []
  }

  const getResumen = () => {
    if (moduloId === 1) return RESUMEN_M1
    if (moduloId === 2) return RESUMEN_M2
    if (moduloId === 3) return RESUMEN_M3
    if (moduloId === 4) return RESUMEN_M4
    if (moduloId === 5) return RESUMEN_M5
    if (moduloId === 6) return RESUMEN_M6
    if (moduloId === 7) return RESUMEN_M7
    if (moduloId === 8) return RESUMEN_M8
    if (moduloId === 9) return RESUMEN_M9
    if (moduloId === 10) return RESUMEN_M10
    return null
  }

  const getModuloLabel = () => {
    if (moduloId === 1) return 'Módulo 1 · SELECT & Básicos'
    if (moduloId === 2) return 'Módulo 2 · WHERE & Filtros'
    if (moduloId === 3) return 'Módulo 3 · JOINs'
    if (moduloId === 4) return 'Módulo 4 · GROUP BY & Agregados'
    if (moduloId === 5) return 'Módulo 5 · Funciones de Agregación'
    if (moduloId === 6) return 'Módulo 6 · Subqueries'
    if (moduloId === 7) return 'Módulo 7 · CTEs'
    if (moduloId === 8) return 'Módulo 8 · Window Functions'
    if (moduloId === 9) return 'Módulo 9 · Optimización'
    if (moduloId === 10) return 'Módulo 10 · Modo Entrevista'
    return `Módulo ${moduloId}`
  }

  const getPrefix = () => `0${moduloId}-`

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
        if (moduloId === 3 && done === 0) setVista('intro-joins')
        if (moduloId === 6 && done === 0) setVista('intro-subqueries')
        if (moduloId === 7 && done === 0) setVista('intro-ctes')
        if (moduloId === 8 && done === 0) setVista('intro-windows')
        if (moduloId === 6 && done === 0) {
          setVista('intro-subqueries')
        }
        if (moduloId === 7 && done === 0) {
          setVista('intro-ctes')
        }
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
    setIntentos(0)
    const lecciones = getLecciones()
    if (lecciones.length > 0 && lecciones[curIdx]) {
      const l = lecciones[curIdx]
      setBlanks(l.blanks ? l.blanks.map(() => '') : [])
      if (l.tipo === 'debugging' && l.errorQuery) setQueryText(l.errorQuery)
      setProg(prev => {
        if (prev[l.id]?.completada) setAnswered(true)
        return prev
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curIdx, curSlide, moduloId])

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

        // Coincidencia exacta: mismos valores Y mismos nombres de columna
        const exact = uRows === sRows && uCols === sCols
        // Coincidencia de texto normalizado
        const normMatch = normalize(q) === normalize(l.solucion)
        // Coincidencia flexible: mismos valores, misma cantidad de columnas
        // (acepta aliases distintos — el usuario no tiene por qué saber el alias exacto)
        const sameColCount = res[0].columns.length === solRes[0].columns.length
        const flexMatch = uRows === sRows && sameColCount

        if (exact || normMatch || flexMatch) {
          setAnswered(true)
          setJustAnswered(true)
          if (!prog[l.id]?.completada) {
            await saveProg(l.id, moduloId, l.xp, hintOpen)
          }
        } else {
          setIntentos(prev => prev + 1)
        }
      }
    } catch (e: any) {
      setResultError(e.message)
      setResult(null)
    }
  }

  // Navegar sin perder progreso
  const goToLesson = (idx: number) => {
    const lecciones = getLecciones()
    if (idx >= 0 && idx < lecciones.length) {
      setCurIdx(idx)
      setVista('leccion')
      window.scrollTo(0, 0)
    }
  }

  const nextLesson = () => {
    const lecciones = getLecciones()
    if (curIdx < lecciones.length - 1) {
      goToLesson(curIdx + 1)
    } else {
      setVista('resumen')
      window.scrollTo(0, 0)
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

    const subtituloStyle: React.CSSProperties = {
      fontSize: '0.92rem', color: '#c8d8f0', lineHeight: 1.8,
      background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.5)',
      borderRadius: '0 10px 10px 0', padding: '14px 16px', marginBottom: 18,
      textAlign: 'justify' as const,
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title={slide.titulo} module="Módulo 0 · Introducción" prog={`${curSlide + 1} / ${total}`} onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 0' }}>

              {/* Slide 1 — concepto visual */}
              {slide.tipo === 'concepto' && (
                <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { ico: '🗄️', label: 'Organizada', desc: 'Los datos se guardan con estructura, no como texto libre' },
                      { ico: '⚡', label: 'Eficiente', desc: 'Millones de registros consultados en milisegundos' },
                      { ico: '🔗', label: 'Relacional', desc: 'Las tablas se conectan entre sí para representar la realidad' },
                    ].map(({ ico, label, desc }) => (
                      <div key={label} style={{ background: 'rgba(77,166,255,0.06)', border: '1px solid rgba(77,166,255,0.15)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{ico}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7dd3fc', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sub)', lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#0b0d14', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Mono', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.8 }}>
                    <span style={{ color: '#475569' }}>-- Pregunta en lenguaje natural:</span><br/>
                    <span style={{ color: '#94a3b8' }}>¿Cuáles son mis clientes de Buenos Aires que gastaron más de $10.000?</span><br/><br/>
                    <span style={{ color: '#475569' }}>-- Misma pregunta en SQL:</span><br/>
                    <span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> nombre, email </span>
                    <span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#a78bfa' }}> clientes </span>
                    <span style={{ color: '#93c5fd' }}>WHERE</span><span style={{ color: '#e2e8f0' }}> ciudad = </span>
                    <span style={{ color: '#86efac' }}>'Buenos Aires'</span>
                    <span style={{ color: '#93c5fd' }}> AND</span><span style={{ color: '#e2e8f0' }}> gasto_total </span>
                    <span style={{ color: '#6ee7b7' }}>&gt; </span><span style={{ color: '#fbbf24' }}>10000</span><span style={{ color: '#475569' }}>;</span>
                  </div>
                </div>
              )}

              {/* Apps grid */}
              {slide.tipo === 'apps' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
                  {[['🏦','Bancos','Movimientos y saldos'],['🛒','Tiendas online','Productos y pedidos'],['📱','Redes sociales','Perfiles y posts'],['🏥','Hospitales','Historias clínicas']].map(([ico,n,d]) => (
                    <div key={n} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{ico}</div>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 2 }}>{n}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DER */}
              {slide.tipo === 'der' && (
                <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                  <svg viewBox="0 0 560 180" style={{ width: '100%', height: 'auto' }} xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="552" height="172" rx="12" fill="rgba(77,166,255,0.04)" stroke="rgba(77,166,255,0.2)" strokeWidth="1.5" strokeDasharray="6,4"/>
                    <text x="18" y="22" fill="rgba(77,166,255,0.5)" fontSize="9" fontFamily="monospace" fontWeight="600">BASE DE DATOS</text>
                    <rect x="20" y="32" width="148" height="132" rx="8" fill="rgba(77,166,255,0.08)" stroke="rgba(77,166,255,0.45)" strokeWidth="1.5"/>
                    <rect x="20" y="32" width="148" height="28" rx="8" fill="rgba(77,166,255,0.22)"/>
                    <rect x="20" y="52" width="148" height="8" fill="rgba(77,166,255,0.22)"/>
                    <text x="94" y="51" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="700" fontFamily="monospace">clientes</text>
                    {[['🔑 id','#94a3b8'],['nombre','#cbd5e1'],['email','#cbd5e1'],['ciudad','#cbd5e1'],['telefono','#cbd5e1']].map(([col, color], i) => (
                      <text key={String(col)} x="34" y={82 + i * 17} fill={color as string} fontSize="10" fontFamily="monospace">{col}</text>
                    ))}
                    <rect x="206" y="32" width="148" height="132" rx="8" fill="rgba(62,207,142,0.08)" stroke="rgba(62,207,142,0.45)" strokeWidth="1.5"/>
                    <rect x="206" y="32" width="148" height="28" rx="8" fill="rgba(62,207,142,0.22)"/>
                    <rect x="206" y="52" width="148" height="8" fill="rgba(62,207,142,0.22)"/>
                    <text x="280" y="51" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700" fontFamily="monospace">pedidos</text>
                    {[['🔑 id','#94a3b8'],['🔗 cliente_id','#fbbf24'],['🔗 producto_id','#fbbf24'],['fecha','#cbd5e1'],['total','#cbd5e1']].map(([col, color], i) => (
                      <text key={String(col)} x="220" y={82 + i * 17} fill={color as string} fontSize="10" fontFamily="monospace">{col}</text>
                    ))}
                    <rect x="392" y="32" width="148" height="132" rx="8" fill="rgba(232,168,56,0.08)" stroke="rgba(232,168,56,0.45)" strokeWidth="1.5"/>
                    <rect x="392" y="32" width="148" height="28" rx="8" fill="rgba(232,168,56,0.22)"/>
                    <rect x="392" y="52" width="148" height="8" fill="rgba(232,168,56,0.22)"/>
                    <text x="466" y="51" textAnchor="middle" fill="#fcd34d" fontSize="11" fontWeight="700" fontFamily="monospace">productos</text>
                    {[['🔑 id','#94a3b8'],['nombre','#cbd5e1'],['precio','#cbd5e1'],['categoria','#cbd5e1'],['stock','#cbd5e1']].map(([col, color], i) => (
                      <text key={String(col)} x="406" y={82 + i * 17} fill={color as string} fontSize="10" fontFamily="monospace">{col}</text>
                    ))}
                    <line x1="168" y1="99" x2="206" y2="99" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5" strokeDasharray="4,3"/>
                    <polygon points="202,95 210,99 202,103" fill="rgba(251,191,36,0.7)"/>
                    <text x="187" y="93" textAnchor="middle" fill="rgba(251,191,36,0.8)" fontSize="8" fontFamily="monospace">1:N</text>
                    <line x1="392" y1="116" x2="354" y2="116" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5" strokeDasharray="4,3"/>
                    <polygon points="358,112 350,116 358,120" fill="rgba(251,191,36,0.7)"/>
                    <text x="373" y="110" textAnchor="middle" fill="rgba(251,191,36,0.8)" fontSize="8" fontFamily="monospace">N:1</text>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      ['📊','Analistas de datos','Extraen insights de millones de filas sin tocar una línea de código extra'],
                      ['💻','Developers','Construyen apps que leen y guardan datos en tiempo real'],
                      ['🔬','Data Scientists','Preparan y limpian datos para modelos de machine learning e IA'],
                      ['📈','Product Managers','Consultan métricas, KPIs y tendencias del negocio de forma autónoma'],
                    ].map(([ico, title, desc]) => (
                      <div key={title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{ico}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>{title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sub)', lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#0b0d14', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontFamily: 'DM Mono', fontSize: '0.8rem', lineHeight: 2 }}>
                    <span style={{ color: '#93c5fd' }}>SELECT</span>
                    <span style={{ color: '#e2e8f0' }}> nombre, salario </span>
                    <span style={{ color: '#93c5fd' }}>FROM</span>
                    <span style={{ color: '#a78bfa' }}> empleados </span>
                    <span style={{ color: '#93c5fd' }}>WHERE</span>
                    <span style={{ color: '#e2e8f0' }}> salario </span>
                    <span style={{ color: '#6ee7b7' }}>&gt; </span>
                    <span style={{ color: '#fbbf24' }}>80000</span>
                    <span style={{ color: '#475569' }}>;</span>
                    <br/>
                    <span style={{ color: '#475569', fontSize: '0.72rem' }}>-- "Dame nombre y salario de los empleados que ganan más de $80k"</span>
                  </div>
                </div>
              )}

              {/* Resumen final */}
              {slide.tipo === 'resumen' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 16 }}>
                  {[
                    ['🗄️','Base de datos','Contiene todas las tablas','var(--amber)'],
                    ['📋','Tabla','Filas y columnas del mismo tipo','var(--nova)'],
                    ['⬇️','Columna','Define el tipo de dato guardado','var(--green)'],
                    ['➡️','Fila','Un registro completo','#f472b6'],
                    ['🔗','Relación','Las tablas se conectan entre sí','#a78bfa'],
                    ['💬','SQL','El lenguaje para consultar datos','#22d3ee'],
                  ].map(([ico,t,d,c]) => (
                    <div key={t} style={{ background: 'var(--bg2)', border: `1px solid ${c}30`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ico}</div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: c, marginBottom: 1 }}>{t}</div>
                        <div style={{ fontSize: '0.67rem', color: 'var(--sub)', lineHeight: 1.3 }}>{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <div style={subtituloStyle}>{slide.subtitulo}</div>
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
  if (![1,2,3,4,5,6,7,8,9,10].includes(moduloId)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '2rem' }}>🚧</div>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Módulo próximamente disponible</div>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>← Volver al dashboard</button>
      </div>
    )
  }

  const lecciones = getLecciones()
  const glosario = getGlosario()
  const resumen = getResumen()
  const total = lecciones.length
  const l = lecciones[curIdx]
  const pct = Math.round(((curIdx + 1) / total) * 100)

  // ── VISTA INTRO WINDOWS ──
  if (vista === 'intro-windows') {
    const concepts = [
      { nombre: 'OVER()', color: '#3b82f6', desc: 'Define la ventana. OVER() vacío = todas las filas. No colapsa el resultado como GROUP BY.', ej: 'SUM(monto) OVER()' },
      { nombre: 'PARTITION BY', color: '#10b981', desc: 'Divide la ventana en grupos. Cada fila mantiene su identidad y ve el resultado de su grupo.', ej: 'SUM(monto) OVER(PARTITION BY zona)' },
      { nombre: 'ORDER BY en OVER', color: '#f59e0b', desc: 'Define el orden dentro de la ventana. Habilita rankings y sumas acumuladas.', ej: 'ROW_NUMBER() OVER(ORDER BY monto DESC)' },
      { nombre: 'ROWS BETWEEN', color: '#a78bfa', desc: 'Ventana deslizante. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW = fila actual + 2 anteriores.', ej: 'AVG(monto) OVER(ORDER BY fecha ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)' },
    ]
    const funcs = [
      ['ROW_NUMBER()', 'Número único por fila', '1, 2, 3, 4...'],
      ['RANK()', 'Ranking con huecos en empates', '1, 1, 3, 4...'],
      ['DENSE_RANK()', 'Ranking sin huecos', '1, 1, 2, 3...'],
      ['LAG(col)', 'Valor de la fila anterior', 'NULL, 100, 200...'],
      ['LEAD(col)', 'Valor de la fila siguiente', '200, 300, NULL...'],
      ['NTILE(n)', 'Divide en n grupos iguales', '1, 1, 2, 2, 3...'],
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Tipos de Window Functions" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 26px) clamp(14px, 4vw, 20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8, textAlign: 'justify' }}>
            Las <strong>Window Functions</strong> calculan valores sobre un conjunto de filas relacionadas <strong>sin eliminar filas del resultado</strong>. A diferencia de GROUP BY que colapsa las filas en una por grupo, las window functions agregan una columna calculada a cada fila existente.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {concepts.map(c => (
              <div key={c.nombre} style={{ background: 'var(--card)', border: `1px solid ${c.color}30`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: `${c.color}15`, padding: '8px 14px', borderBottom: `1px solid ${c.color}20` }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', fontWeight: 700, color: c.color }}>{c.nombre}</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#c8d8f0', lineHeight: 1.6, marginBottom: 8, textAlign: 'justify' }}>{c.desc}</div>
                  <div style={{ background: '#0b0d14', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Mono', fontSize: '0.72rem', color: '#6ee7b7' }}>{c.ej}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)' }}>Funciones disponibles</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {funcs.map(([fn, desc, ej], i) => (
                <div key={fn} style={{ padding: '10px 14px', borderBottom: i < funcs.length - 2 ? '1px solid var(--border)' : 'none', borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.78rem', fontWeight: 700, color: 'var(--nova)', marginBottom: 3 }}>{fn}</div>
                  <div style={{ fontSize: '0.73rem', color: '#c8d8f0', marginBottom: 2 }}>{desc}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{ej}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }


  // ── VISTA INTRO SUBQUERIES ──
  if ((vista as string) === 'intro-subqueries') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Cómo funciona una Subquery" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px,4vw,26px) clamp(14px,4vw,20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8, textAlign: 'justify' }}>
            Una <strong>subquery</strong> es un SELECT dentro de otro SELECT. SQL la ejecuta primero y usa su resultado en el query principal. Son como preguntas anidadas: primero respondés la de adentro, luego la de afuera.
          </div>

          {/* Diagrama de flujo */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 16 }}>Estructura y flujo de ejecución</div>
            <div style={{ background: '#0b0d14', borderRadius: 10, padding: '16px', fontFamily: 'DM Mono', fontSize: '0.8rem', lineHeight: 2, marginBottom: 16 }}>
              <span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> nombre </span>
              <span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#a78bfa' }}> pacientes</span><br/>
              <span style={{ color: '#93c5fd' }}>WHERE</span><span style={{ color: '#e2e8f0' }}> medico_id </span>
              <span style={{ color: '#93c5fd' }}>IN</span><span style={{ color: '#e2e8f0' }}> (</span>
              <span style={{ color: '#fbbf24' }}> ← query externo</span><br/>
              <span style={{ color: '#e2e8f0' }}>   </span>
              <span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> id </span>
              <span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#a78bfa' }}> medicos</span><br/>
              <span style={{ color: '#e2e8f0' }}>   </span>
              <span style={{ color: '#93c5fd' }}>WHERE</span><span style={{ color: '#e2e8f0' }}> experiencia </span>
              <span style={{ color: '#6ee7b7' }}>&gt; </span><span style={{ color: '#fbbf24' }}>5</span>
              <span style={{ color: '#86efac' }}> ← subquery (se ejecuta primero)</span><br/>
              <span style={{ color: '#e2e8f0' }}>)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['1', '#fbbf24', 'SQL ejecuta la subquery interna', 'SELECT id FROM medicos WHERE experiencia > 5 → [1, 3, 5]'],
                ['2', '#93c5fd', 'Usa el resultado en el WHERE externo', 'WHERE medico_id IN (1, 3, 5)'],
                ['3', '#6ee7b7', 'Devuelve las filas que coinciden', 'Los pacientes de esos médicos'],
              ].map(([n, color, titulo, desc]) => (
                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}60`, color, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{titulo}</div>
                    <div style={{ fontFamily: 'DM Mono', fontSize: '0.74rem', color: 'var(--sub)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 tipos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { nombre: 'Subquery en WHERE', color: '#3b82f6', desc: 'Filtra filas según el resultado de la subquery. La más común.', ej: 'WHERE id IN (SELECT id FROM ...)' },
              { nombre: 'Subquery escalar', color: '#10b981', desc: 'Devuelve un solo valor. Usable con =, >, <.', ej: 'WHERE salario > (SELECT AVG(salario) FROM ...)' },
              { nombre: 'Tabla derivada (FROM)', color: '#f59e0b', desc: 'Subquery en el FROM que actúa como tabla. Requiere alias.', ej: 'FROM (SELECT ...) AS sub' },
              { nombre: 'Subquery correlacionada', color: '#a78bfa', desc: 'Referencia columnas del query externo. Se ejecuta por fila.', ej: '(SELECT COUNT(*) FROM pedidos WHERE cliente_id = c.id)' },
            ].map(j => (
              <div key={j.nombre} style={{ background: 'var(--card)', border: `1px solid ${j.color}30`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: `${j.color}15`, padding: '8px 14px', borderBottom: `1px solid ${j.color}20` }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.78rem', fontWeight: 700, color: j.color }}>{j.nombre}</div>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#c8d8f0', lineHeight: 1.6, marginBottom: 8 }}>{j.desc}</div>
                  <div style={{ background: '#0b0d14', borderRadius: 6, padding: '5px 9px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: '#6ee7b7' }}>{j.ej}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }

  // ── VISTA INTRO CTEs ──
  if ((vista as string) === 'intro-ctes') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Cómo funcionan los CTEs" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px,4vw,26px) clamp(14px,4vw,20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8, textAlign: 'justify' }}>
            Un <strong>CTE</strong> (Common Table Expression) es una consulta con nombre que definís antes del SELECT principal. Se comporta como una tabla temporal que solo existe durante esa consulta. Son la forma más limpia de organizar queries complejos.
          </div>

          {/* Estructura de un CTE */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 14 }}>Un solo CTE</div>
            <div style={{ background: '#0b0d14', borderRadius: 10, padding: '16px', fontFamily: 'DM Mono', fontSize: '0.8rem', lineHeight: 2, marginBottom: 14 }}>
              <span style={{ color: '#6ee7b7' }}>-- 1. Definís el CTE con un nombre</span><br/>
              <span style={{ color: '#93c5fd' }}>WITH</span><span style={{ color: '#fbbf24' }}> grandes_envios </span><span style={{ color: '#93c5fd' }}>AS</span><span style={{ color: '#e2e8f0' }}> (</span><br/>
              <span style={{ color: '#e2e8f0' }}>  </span><span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> * </span><span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#a78bfa' }}> envios </span><span style={{ color: '#93c5fd' }}>WHERE</span><span style={{ color: '#e2e8f0' }}> peso_kg </span><span style={{ color: '#6ee7b7' }}>&gt; </span><span style={{ color: '#fbbf24' }}>50</span><br/>
              <span style={{ color: '#e2e8f0' }}>)</span><br/>
              <span style={{ color: '#6ee7b7' }}>-- 2. Lo usás como si fuera una tabla</span><br/>
              <span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> * </span><span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#fbbf24' }}> grandes_envios</span>
            </div>
          </div>

          {/* CTEs múltiples */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 14 }}>Múltiples CTEs — separados por coma</div>
            <div style={{ background: '#0b0d14', borderRadius: 10, padding: '16px', fontFamily: 'DM Mono', fontSize: '0.78rem', lineHeight: 2 }}>
              <span style={{ color: '#93c5fd' }}>WITH</span><br/>
              <span style={{ color: '#fbbf24' }}>paso1 </span><span style={{ color: '#93c5fd' }}>AS</span><span style={{ color: '#e2e8f0' }}> (</span><br/>
              <span style={{ color: '#e2e8f0' }}>  </span><span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> chofer_id, </span><span style={{ color: '#93c5fd' }}>COUNT</span><span style={{ color: '#e2e8f0' }}>(*) </span><span style={{ color: '#93c5fd' }}>AS</span><span style={{ color: '#e2e8f0' }}> total</span><br/>
              <span style={{ color: '#e2e8f0' }}>  </span><span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#a78bfa' }}> envios </span><span style={{ color: '#93c5fd' }}>GROUP BY</span><span style={{ color: '#e2e8f0' }}> chofer_id</span><br/>
              <span style={{ color: '#e2e8f0' }}>)<span style={{ color: '#fbbf24' }}>,   </span></span>
              <span style={{ color: '#6ee7b7' }}>← coma entre CTEs</span><br/>
              <span style={{ color: '#fbbf24' }}>paso2 </span><span style={{ color: '#93c5fd' }}>AS</span><span style={{ color: '#e2e8f0' }}> (</span><br/>
              <span style={{ color: '#e2e8f0' }}>  </span><span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> c.nombre, p.total</span><br/>
              <span style={{ color: '#e2e8f0' }}>  </span><span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#fbbf24' }}> paso1 </span><span style={{ color: '#e2e8f0' }}>p </span>
              <span style={{ color: '#93c5fd' }}>JOIN</span><span style={{ color: '#a78bfa' }}> choferes </span><span style={{ color: '#e2e8f0' }}>c </span><span style={{ color: '#93c5fd' }}>ON</span><span style={{ color: '#e2e8f0' }}> p.chofer_id = c.id</span><br/>
              <span style={{ color: '#6ee7b7' }}>  -- paso2 puede usar paso1</span><br/>
              <span style={{ color: '#e2e8f0' }}>)</span><br/>
              <span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> * </span><span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#fbbf24' }}> paso2 </span><span style={{ color: '#93c5fd' }}>WHERE</span><span style={{ color: '#e2e8f0' }}> total </span><span style={{ color: '#6ee7b7' }}>&gt; </span><span style={{ color: '#fbbf24' }}>5</span>
            </div>
          </div>

          {/* CTE vs Subquery */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)' }}>CTE vs Subquery — misma lógica, distinta legibilidad</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '14px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>❌ Con subquery anidada</div>
                <div style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.8 }}>
                  SELECT zona, total<br/>FROM (<br/>  SELECT zona, SUM(peso) AS total<br/>  FROM envios<br/>  GROUP BY zona<br/>) WHERE total &gt; 500
                </div>
              </div>
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>✓ Con CTE</div>
                <div style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: '#c8d8f0', lineHeight: 1.8 }}>
                  WITH totales AS (<br/>  SELECT zona, SUM(peso) AS total<br/>  FROM envios GROUP BY zona<br/>)<br/>SELECT zona, total<br/>FROM totales WHERE total &gt; 500
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }

  // ── VISTA INTRO SUBQUERIES ──
  if ((vista as string) === 'intro-subqueries') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Qué es una Subquery" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px,4vw,26px) clamp(14px,4vw,20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8 }}>
            Una <strong>subquery</strong> es un SELECT dentro de otro SELECT. SQL ejecuta primero la subquery interna, obtiene un resultado, y lo usa en el query externo. Es como resolver un problema en dos pasos.
          </div>
          {/* Diagrama de flujo de subquery */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)' }}>Cómo se ejecuta</div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { paso: '1', label: 'SQL ejecuta la subquery interna', code: "SELECT id FROM medicos WHERE anios_experiencia > 5", color: '#f59e0b', result: '→ devuelve: [1, 3, 5]' },
                  { paso: '2', label: 'Usa el resultado en el query externo', code: 'SELECT nombre FROM pacientes WHERE medico_id IN [1, 3, 5]', color: '#3b82f6', result: '→ filtra pacientes' },
                ].map(({ paso, label, code, color, result }) => (
                  <div key={paso} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}`, color, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{paso}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: '#c8d8f0', marginBottom: 4 }}>{label}</div>
                      <div style={{ background: '#0b0d14', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Mono', fontSize: '0.72rem', color, marginBottom: 4 }}>{code}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Tres tipos de subquery */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { nombre: 'En el WHERE con IN', color: '#3b82f6', desc: 'La más común. La subquery devuelve una lista de valores para filtrar.', ej: 'WHERE id IN (SELECT id FROM tabla WHERE cond)' },
              { nombre: 'Escalar (valor único)', color: '#10b981', desc: 'Devuelve un solo valor. Se usa con =, >, <.', ej: 'WHERE precio > (SELECT AVG(precio) FROM tabla)' },
              { nombre: 'En el FROM', color: '#f59e0b', desc: 'La subquery actúa como tabla temporal. Requiere alias.', ej: 'FROM (SELECT col, COUNT(*) AS n FROM t GROUP BY col) AS sub' },
              { nombre: 'Correlacionada', color: '#a78bfa', desc: 'Referencia columnas del query externo. Se ejecuta por cada fila.', ej: '(SELECT COUNT(*) FROM pedidos WHERE cliente_id = clientes.id)' },
            ].map(t => (
              <div key={t.nombre} style={{ background: 'var(--card)', border: `1px solid ${t.color}25`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: `${t.color}12`, padding: '8px 12px', borderBottom: `1px solid ${t.color}20` }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.78rem', fontWeight: 700, color: t.color }}>{t.nombre}</div>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#c8d8f0', lineHeight: 1.5, marginBottom: 8 }}>{t.desc}</div>
                  <div style={{ background: '#0b0d14', borderRadius: 6, padding: '5px 8px', fontFamily: 'DM Mono', fontSize: '0.68rem', color: t.color }}>{t.ej}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }

  // ── VISTA INTRO CTEs ──
  if ((vista as string) === 'intro-ctes') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Qué es un CTE" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px,4vw,26px) clamp(14px,4vw,20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8 }}>
            Un <strong>CTE</strong> (Common Table Expression) es una consulta con nombre que podés usar dentro de otra consulta. Se define con <strong>WITH nombre AS (query)</strong> y luego se usa como una tabla. Son como los pasos de un algoritmo: cada CTE resuelve una parte del problema.
          </div>
          {/* Sintaxis visual de CTE */}
          <div style={{ background: '#0b0d14', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 12 }}>Sintaxis</div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', lineHeight: 2 }}>
              <span style={{ color: '#93c5fd' }}>WITH</span><span style={{ color: '#fbbf24' }}> nombre_cte</span><span style={{ color: '#e2e8f0' }}> AS (</span><br/>
              <span style={{ color: '#94a3b8', marginLeft: 16 }}>  -- query que define el CTE</span><br/>
              <span style={{ color: '#93c5fd', marginLeft: 16 }}>  SELECT</span><span style={{ color: '#e2e8f0' }}> col1, COUNT(*) AS n</span><br/>
              <span style={{ color: '#93c5fd', marginLeft: 16 }}>  FROM</span><span style={{ color: '#a78bfa' }}> tabla</span><br/>
              <span style={{ color: '#93c5fd', marginLeft: 16 }}>  GROUP BY</span><span style={{ color: '#e2e8f0' }}> col1</span><br/>
              <span style={{ color: '#e2e8f0' }}>)</span><br/>
              <span style={{ color: '#93c5fd' }}>SELECT</span><span style={{ color: '#e2e8f0' }}> * </span><span style={{ color: '#93c5fd' }}>FROM</span><span style={{ color: '#fbbf24' }}> nombre_cte</span><br/>
              <span style={{ color: '#93c5fd' }}>WHERE</span><span style={{ color: '#e2e8f0' }}> n &gt; 5;</span>
            </div>
          </div>
          {/* CTEs múltiples */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)' }}>Múltiples CTEs — cada uno usa al anterior</div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { paso: 'CTE 1', label: 'Filtrá o calculá algo', code: 'WITH paso1 AS (\n  SELECT zona, SUM(peso_kg) AS total_kg\n  FROM envios GROUP BY zona\n),', color: '#3b82f6' },
                  { paso: 'CTE 2', label: 'Usá el resultado del CTE 1', code: 'paso2 AS (\n  SELECT zona, total_kg\n  FROM paso1 WHERE total_kg > 500\n)', color: '#10b981' },
                  { paso: 'Query final', label: 'Consultá el último CTE', code: 'SELECT * FROM paso2 ORDER BY total_kg DESC;', color: '#a78bfa' },
                ].map(({ paso, label, code, color }) => (
                  <div key={paso} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ padding: '2px 8px', borderRadius: 5, background: `${color}18`, border: `1px solid ${color}40`, color, fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap', marginTop: 2 }}>{paso}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sub)', marginBottom: 4 }}>{label}</div>
                      <div style={{ background: '#0b0d14', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Mono', fontSize: '0.7rem', color, whiteSpace: 'pre' }}>{code}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* CTE vs Subquery */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 12 }}>CTE vs Subquery — hacen lo mismo, diferente legibilidad</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#ef4444', marginBottom: 6, fontWeight: 600 }}>❌ Subquery anidada</div>
                <pre style={{ background: '#0b0d14', borderRadius: 6, padding: '8px 10px', fontFamily: 'DM Mono', fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{'SELECT zona, total\nFROM (\n  SELECT zona,\n  SUM(peso_kg) AS total\n  FROM envios\n  GROUP BY zona\n)\nWHERE total > 500'}</pre>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', marginBottom: 6, fontWeight: 600 }}>✓ Con CTE</div>
                <pre style={{ background: '#0b0d14', borderRadius: 6, padding: '8px 10px', fontFamily: 'DM Mono', fontSize: '0.68rem', color: '#6ee7b7', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{'WITH totales AS (\n  SELECT zona,\n  SUM(peso_kg) AS total\n  FROM envios\n  GROUP BY zona\n)\nSELECT zona, total\nFROM totales\nWHERE total > 500'}</pre>
              </div>
            </div>
          </div>
          <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }

  // ── VISTA INTRO JOINS ──
  if (vista === 'intro-joins') {
    const joins = [
      {
        nombre: 'INNER JOIN',
        color: '#3b82f6',
        colorBg: 'rgba(59,130,246,0.12)',
        desc: 'Solo las filas que tienen coincidencia en AMBAS tablas.',
        ejemplo: 'Clientes que hicieron al menos un pedido.',
        svg: (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 80 }}>
            <circle cx="75" cy="60" r="45" fill="rgba(77,166,255,0.08)" stroke="rgba(77,166,255,0.4)" strokeWidth="1.5"/>
            <circle cx="125" cy="60" r="45" fill="rgba(77,166,255,0.08)" stroke="rgba(77,166,255,0.4)" strokeWidth="1.5"/>
            {/* Intersección resaltada */}
            <clipPath id="clip-inner">
              <circle cx="125" cy="60" r="45"/>
            </clipPath>
            <circle cx="75" cy="60" r="45" fill="rgba(59,130,246,0.5)" clipPath="url(#clip-inner)"/>
            <text x="55" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">A</text>
            <text x="145" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">B</text>
            <text x="100" y="58" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace" fontWeight="700">A∩B</text>
          </svg>
        ),
      },
      {
        nombre: 'LEFT JOIN',
        color: '#10b981',
        colorBg: 'rgba(16,185,129,0.12)',
        desc: 'TODAS las filas de la tabla izquierda + coincidencias de la derecha. La derecha puede ser NULL.',
        ejemplo: 'Todos los clientes, hayan comprado o no.',
        svg: (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 80 }}>
            <circle cx="75" cy="60" r="45" fill="rgba(16,185,129,0.5)" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5"/>
            <circle cx="125" cy="60" r="45" fill="rgba(77,166,255,0.08)" stroke="rgba(77,166,255,0.35)" strokeWidth="1.5"/>
            {/* Intersección misma pero más clara */}
            <clipPath id="clip-left">
              <circle cx="125" cy="60" r="45"/>
            </clipPath>
            <circle cx="75" cy="60" r="45" fill="rgba(16,185,129,0.5)" clipPath="url(#clip-left)"/>
            <text x="55" y="64" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" fontWeight="700">A</text>
            <text x="145" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">B</text>
          </svg>
        ),
      },
      {
        nombre: 'RIGHT JOIN',
        color: '#f59e0b',
        colorBg: 'rgba(245,158,11,0.12)',
        desc: 'TODAS las filas de la tabla derecha + coincidencias de la izquierda. La izquierda puede ser NULL.',
        ejemplo: 'Todos los productos, hayan sido pedidos o no.',
        svg: (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 80 }}>
            <circle cx="75" cy="60" r="45" fill="rgba(77,166,255,0.08)" stroke="rgba(77,166,255,0.35)" strokeWidth="1.5"/>
            <circle cx="125" cy="60" r="45" fill="rgba(245,158,11,0.5)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5"/>
            <clipPath id="clip-right">
              <circle cx="75" cy="60" r="45"/>
            </clipPath>
            <circle cx="125" cy="60" r="45" fill="rgba(245,158,11,0.5)" clipPath="url(#clip-right)"/>
            <text x="55" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">A</text>
            <text x="145" y="64" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" fontWeight="700">B</text>
          </svg>
        ),
      },
      {
        nombre: 'FULL OUTER JOIN',
        color: '#a78bfa',
        colorBg: 'rgba(167,139,250,0.12)',
        desc: 'TODAS las filas de ambas tablas. Donde no hay coincidencia, aparece NULL en el lado que falta.',
        ejemplo: 'Todos los clientes y todos los pedidos, estén relacionados o no.',
        svg: (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 80 }}>
            <circle cx="75" cy="60" r="45" fill="rgba(167,139,250,0.45)" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5"/>
            <circle cx="125" cy="60" r="45" fill="rgba(167,139,250,0.45)" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5"/>
            <text x="55" y="64" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" fontWeight="700">A</text>
            <text x="145" y="64" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" fontWeight="700">B</text>
            <text x="100" y="58" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace" fontWeight="700">A∪B</text>
          </svg>
        ),
      },
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Tipos de JOIN" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 26px) clamp(14px, 4vw, 20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>

          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8, textAlign: 'justify' }}>
            Un <strong>JOIN</strong> combina filas de dos tablas basándose en una columna relacionada. La diferencia entre los tipos de JOIN está en <strong>qué filas incluye</strong> cuando no hay coincidencia. Pensá en cada tabla como un círculo: el resultado del JOIN es la parte del diagrama que está coloreada.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {joins.map(j => (
              <div key={j.nombre} style={{ background: 'var(--card)', border: `1px solid ${j.color}30`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: j.colorBg, borderBottom: `1px solid ${j.color}20`, padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', fontWeight: 700, color: j.color }}>{j.nombre}</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ marginBottom: 10 }}>{j.svg}</div>
                  <div style={{ fontSize: '0.82rem', color: '#c8d8f0', lineHeight: 1.6, marginBottom: 8, textAlign: 'justify' }}>{j.desc}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--sub)', fontStyle: 'italic', lineHeight: 1.5 }}>Ej: {j.ejemplo}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla comparativa */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)' }}>
              Comparativa rápida
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: 420, borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    {['JOIN', 'Filas de A', 'Filas de B', 'Solo coincidencias'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--sub)', fontSize: '0.7rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['INNER JOIN', '✓ solo las que coinciden', '✓ solo las que coinciden', '✓ Sí'],
                    ['LEFT JOIN', '✓ todas', '~ con NULL si no coincide', '✗ No'],
                    ['RIGHT JOIN', '~ con NULL si no coincide', '✓ todas', '✗ No'],
                    ['FULL OUTER JOIN', '✓ todas', '✓ todas', '✗ No'],
                  ].map(([join, a, b, solo], i) => (
                    <tr key={join} style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '8px 12px', color: '#7dd3fc', fontWeight: 700 }}>{join}</td>
                      <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{a}</td>
                      <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{b}</td>
                      <td style={{ padding: '8px 12px', color: solo === '✓ Sí' ? 'var(--green)' : 'var(--sub)' }}>{solo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => { setVista('leccion'); setCurIdx(0) }}
            style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}
          >
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }

  // ── VISTA RESUMEN ──
  if (vista === 'resumen' && resumen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Resumen del módulo" module={getModuloLabel()} prog="✓ Completado" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(62,207,142,0.05)', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 15, padding: '24px', marginBottom: 20 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>{resumen.titulo}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--sub)' }}>Completaste todas las lecciones del módulo</div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--nova)', marginBottom: 16 }}>Conceptos clave</div>
            {resumen.puntos.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < resumen.puntos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(77,166,255,0.15)', color: 'var(--nova)', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div style={{ fontSize: '0.86rem', color: '#c8d8f0', lineHeight: 1.5 }}>{p}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0b0d14', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 10 }}>Sintaxis del módulo</div>
            <pre style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', color: '#7dd3fc', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{resumen.sintaxis}</pre>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px 18px', color: 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>← Repasar lecciones</button>
            <button onClick={() => setVista('glosario')} style={{ background: 'rgba(77,166,255,0.1)', border: '1px solid rgba(77,166,255,0.3)', borderRadius: 9, padding: '10px 18px', color: 'var(--nova)', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}>📖 Ver glosario</button>
            <button onClick={() => router.replace('/dashboard')} style={{ background: 'var(--green)', color: '#0a2417', border: 'none', borderRadius: 9, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem', marginLeft: 'auto' }}>Volver al inicio →</button>
          </div>
        </div>
      </div>
    )
  }

  // ── VISTA GLOSARIO ──
  if (vista === 'glosario') {
    const filtrado = glosario.filter(g =>
      g.termino.toLowerCase().includes(glosarioSearch.toLowerCase()) ||
      g.descripcion.toLowerCase().includes(glosarioSearch.toLowerCase())
    )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Glosario" module={getModuloLabel()} prog={`${glosario.length} términos`} onBack={() => setVista('leccion')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 20px)', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <input
            value={glosarioSearch}
            onChange={e => setGlosarioSearch(e.target.value)}
            placeholder="Buscar término..."
            style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.9rem', outline: 'none', marginBottom: 16 }}
          />
          {filtrado.map((g, i) => (
            <div key={g.termino} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.9rem', fontWeight: 700, color: 'var(--nova)' }}>{g.termino}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#c8d8f0', lineHeight: 1.6, marginBottom: 10 }}>{g.descripcion}</div>
              <div style={{ background: '#0b0d14', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', fontFamily: 'DM Mono', fontSize: '0.75rem', color: '#6ee7b7' }}>{g.ejemplo}</div>
            </div>
          ))}
          {filtrado.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--sub)', padding: '40px 0', fontSize: '0.9rem' }}>No se encontraron términos</div>
          )}
        </div>
      </div>
    )
  }

  // ── VISTA LECCIÓN ──
  // Tablas a mostrar por lección — para JOINs y lecciones multi-tabla
  const TABLAS_JOIN: Record<string, string[]> = {
    // M5
    '05-11': ['transacciones', 'cuentas'],
    '05-12': ['transacciones', 'cuentas'],
    // M6
    '06-01': ['medicos', 'consultas'],
    '06-02': ['medicos'],
    '06-03': ['consultas', 'medicos'],
    '06-04': ['medicos', 'consultas'],
    '06-05': ['medicos', 'consultas'],
    '06-06': ['medicos', 'consultas'],
    '06-07': ['pacientes', 'consultas'],
    '06-08': ['medicos', 'consultas'],
    '06-09': ['pacientes', 'consultas'],
    '06-10': ['medicos', 'consultas'],
    // M3
    '03-01': ['pedidos', 'clientes'],
    '03-02': ['pedidos', 'clientes'],
    '03-03': ['pedidos', 'clientes', 'productos'],
    '03-04': ['clientes', 'pedidos'],
    '03-05': ['clientes', 'pedidos'],
    '03-06': ['pedidos', 'clientes'],
    '03-07': ['pedidos', 'clientes'],
    '03-08': ['pedidos', 'clientes'],
    '03-09': ['empleados'],
    '03-10': ['pedidos', 'productos'],
    '03-11': ['pedidos', 'clientes', 'productos'],
    '03-12': ['pedidos', 'clientes'],
    // M9
    '09-10': ['posts', 'usuarios'],
    // M10
    '10-03': ['usuarios', 'posts'],
    '10-05': ['posts'],
    '10-06': ['posts'],
    '10-08': ['ventas'],
    '10-09': ['metricas_red'],
    '10-10': ['usuarios', 'posts'],
  }

  const PREVIEW: Record<string, { cols: string[]; rows: any[][] }> = {
    peliculas: { cols: ['id','titulo','genero','anio','calificacion'], rows: [[1,'Galaxia Perdida','Ciencia Ficción',2021,8.3],[2,'El Último Tango','Drama',2019,7.1],[3,'Risa Sin Fin','Comedia',2022,6.5]] },
    series: { cols: ['id','titulo','genero','temporadas','calificacion'], rows: [[1,'El Imperio Caído','Drama',4,9.2],[2,'Detectives del Sur','Crimen',2,8.0]] },
    empleados: { cols: ['id','nombre','departamento','salario','jefe_id'], rows: [[1,'Ana García','Ventas',72000,3],[2,'Luis Pérez','Sistemas',95000,4],[3,'María López','Marketing',68000,null]] },
    clientes: { cols: ['id','nombre','email','ciudad'], rows: [[1,'Martina Rodríguez','martina@mail.com','Buenos Aires'],[2,'Pablo García','pablo@mail.com','Córdoba'],[3,'Lucia Fernández','lucia@mail.com','Buenos Aires']] },
    pedidos: { cols: ['id','cliente_id','producto_id','total','estado'], rows: [[1,1,1,85000,'completado'],[2,1,2,4500,'completado'],[3,2,3,32000,'pendiente']] },
    productos: { cols: ['id','nombre','categoria','precio','stock'], rows: [[1,'Notebook Pro','Electrónica',85000,15],[2,'Mouse Inalámbrico','Electrónica',4500,80],[3,'Silla Ergonómica','Muebles',32000,20]] },
    pedidos_restaurante: { cols: ['id','mesa','categoria','importe','turno'], rows: [[1,1,'Entradas',850,'noche'],[2,1,'Principal',3200,'noche'],[3,2,'Principal',2800,'mediodia']] },
    transacciones: { cols: ['id','cuenta_id','tipo','monto','estado','fecha'], rows: [[1,1,'debito',1500,'aprobada','2024-01-05'],[2,1,'credito',85000,'aprobada','2024-01-10'],[3,2,'debito',3200,'aprobada','2024-01-15']] },
    cuentas: { cols: ['cuenta_id','titular','email','tipo_cuenta','saldo'], rows: [[1,'Lucía Fernández','lucia@banco.com','caja_ahorro',18500],[2,'Martín García','martin@banco.com','cuenta_corriente',42000]] },
    medicos: { cols: ['id','nombre','especialidad','anios_experiencia'], rows: [[1,'Dr. Carlos Méndez','Cardiología',15],[2,'Dra. Ana Ramos','Pediatría',8],[3,'Dr. Luis Torres','Neurología',22]] },
    pacientes: { cols: ['id','nombre','edad','medico_id','diagnostico_principal'], rows: [[1,'Roberto Alvarez',62,1,'Hipertensión'],[2,'Carmen Soto',45,2,'Control rutinario'],[3,'Pablo Herrera',71,3,'Parkinson']] },
    consultas: { cols: ['id','paciente_id','medico_id','diagnostico','costo'], rows: [[1,1,1,'Hipertensión controlada',4500],[2,2,2,'Vacunación',2800],[3,3,3,'Control Parkinson',6200]] },
    choferes: { cols: ['id','nombre','zona','antiguedad_anios'], rows: [[1,'Carlos Díaz','Norte',8],[2,'Laura Martínez','Sur',5],[3,'Miguel Torres','Norte',12]] },
    envios: { cols: ['id','chofer_id','zona','peso_kg','estado'], rows: [[1,1,'Norte',45.5,'completado'],[2,1,'Norte',78.2,'completado'],[3,2,'Sur',23.1,'completado']] },
    ventas: { cols: ['id','vendedor_id','zona','monto','fecha'], rows: [[1,101,'Norte',8500,'2024-01-03'],[2,102,'Sur',12300,'2024-01-05'],[3,103,'Norte',6200,'2024-01-07']] },
    usuarios: { cols: ['id','nombre','username','email','pais','es_premium'], rows: [[1,'Ana Garcia','anagarcia','ana@mail.com','Argentina',1],[2,'Luis Perez','luisperez','luis@mail.com','Mexico',0]] },
    posts: { cols: ['id','usuario_id','titulo','categoria','cantidad_likes','fecha'], rows: [[1,1,'Mi primer post','Tech',1200,'2024-01-05'],[2,1,'SQL es increible','Tech',890,'2024-01-15'],[3,2,'Viajando por Mexico','Travel',450,'2024-01-20']] },
    metricas_red: { cols: ['id','mes','plataforma','likes'], rows: [[1,'2024-01','Instagram',45200],[2,'2024-01','Twitter',18900],[3,'2024-01','Facebook',12400]] },
  }

  const pv = PREVIEW[l.tabla] || PREVIEW.peliculas
  const badgeColor = { escribir: 'var(--green)', completar: 'var(--nova)', debugging: 'var(--amber)' }[l.tipo]
  const badgeBg = { escribir: 'rgba(62,207,142,0.09)', completar: 'rgba(77,166,255,0.09)', debugging: 'rgba(232,168,56,0.09)' }[l.tipo]
  const badgeLabel = { escribir: 'Escribir desde cero', completar: 'Completar el query', debugging: 'Debugging' }[l.tipo]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <TopBar title={l.titulo} module={getModuloLabel()} prog={`${curIdx + 1} / ${total}`} onBack={() => router.replace('/dashboard')} />

      <div style={{ flex: 1, padding: '26px 20px', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>

        {/* Navegación entre lecciones */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {lecciones.map((lec, i) => {
            const completada = prog[lec.id]?.completada
            const esActual = i === curIdx
            return (
              <button
                key={lec.id}
                onClick={() => goToLesson(i)}
                style={{
                  minWidth: 28, height: 28, borderRadius: 7, border: 'none',
                  background: esActual ? 'var(--nova2)' : completada ? 'rgba(62,207,142,0.15)' : 'var(--bg3)',
                  color: esActual ? '#fff' : completada ? 'var(--green)' : 'var(--sub)',
                  fontSize: '0.75rem', fontWeight: esActual ? 700 : 400, cursor: 'pointer',
                  fontFamily: 'DM Mono', flexShrink: 0,
                  outline: esActual ? '2px solid var(--nova)' : 'none',
                }}
              >
                {completada && !esActual ? '✓' : i + 1}
              </button>
            )
          })}
          {(moduloId === 3 || moduloId === 6 || moduloId === 7 || moduloId === 8) && (
            <button
              onClick={() => {
                if (moduloId === 3) setVista('intro-joins')
                else if (moduloId === 6) setVista('intro-subqueries')
                else if (moduloId === 7) setVista('intro-ctes')
                else setVista('intro-windows')
              }}
              style={{ padding: '0 10px', height: 32, borderRadius: 8, border: '1px solid rgba(77,166,255,0.3)', background: 'rgba(77,166,255,0.08)', color: 'var(--nova)', fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
            >{ {3:'⬤⬤ JOINs', 6:'📦 Subqueries', 7:'🔄 CTEs', 8:'⬤ OVER()'}[moduloId] }</button>
          )}
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={() => setVista('glosario')}
              style={{ padding: '0 12px', height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--sub)', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >📖</button>
          </div>
        </div>

        {/* Banner racha */}
        {rachaAnimate && (
          <div style={{ background: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🔥</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--amber)' }}>¡Racha activa! {perfil?.racha_actual} día{perfil?.racha_actual !== 1 ? 's' : ''} seguido{perfil?.racha_actual !== 1 ? 's' : ''}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sub)' }}>Volvé mañana para seguir la racha 💪</div>
            </div>
          </div>
        )}

        {/* Teoría */}
        <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 18, fontSize: '0.9rem', color: '#c8d8f0', lineHeight: 1.8, textAlign: 'justify' }}
          dangerouslySetInnerHTML={{ __html: l.teoria }} />

        {/* Tarjeta ejercicio */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '13px 17px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 5, background: badgeBg, color: badgeColor }}>{badgeLabel}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--sub)', marginLeft: 'auto' }}>+<strong style={{ color: 'var(--green)' }}>{l.xp}</strong> XP</span>
          </div>

          <div style={{ padding: '18px 17px' }}>
            <div style={{ fontSize: '0.97rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.6, marginBottom: 15, color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: l.enunciado.replace(/\n/g, '<br/>') }} />

            {/* Tablas relacionadas — para JOINs muestra todas las involucradas */}
            {(() => {
              const tablaNames = TABLAS_JOIN[l.id] || [l.tabla]
              return (
                <>
                  <div onClick={() => setDataOpen(!dataOpen)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: 'var(--sub)', cursor: 'pointer', marginBottom: 12, padding: '4px 9px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7 }}>
                    📋 Ver tablas: {tablaNames.map((t, i) => <span key={t}><strong style={{ color: 'var(--nova)' }}>{t}</strong>{i < tablaNames.length - 1 ? <span style={{ color: 'var(--sub)', margin: '0 4px' }}>+</span> : null}</span>)} {dataOpen ? '▴' : '▾'}
                  </div>
                  {dataOpen && (
                    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {tablaNames.map(tName => {
                        const tData = PREVIEW[tName]
                        if (!tData) return null
                        return (
                          <div key={tName}>
                            <div style={{ fontFamily: 'DM Mono', fontSize: '0.68rem', color: 'var(--nova)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tName}</div>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.72rem' }}>
                                <thead><tr>{tData.cols.map(c => <th key={c} style={{ padding: '6px 9px', border: '1px solid var(--border)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg3)', color: 'var(--sub)' }}>{c}</th>)}</tr></thead>
                                <tbody>
                                  {tData.rows.map((row, ri) => <tr key={ri}>{row.map((v, ci) => <td key={ci} style={{ padding: '5px 9px', border: '1px solid var(--border)' }}>{v !== null ? String(v) : <span style={{ color: 'var(--dim)' }}>NULL</span>}</td>)}</tr>)}
                                  <tr><td colSpan={tData.cols.length} style={{ padding: '5px 9px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--dim)', fontSize: '0.68rem' }}>… más filas</td></tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )
            })()}

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
                  style={{ minHeight: 80 }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={runQuery} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem', flexShrink: 0 }}>▶ Ejecutar</button>
              <button onClick={() => setHintOpen(!hintOpen)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 15px', color: hintOpen ? 'var(--amber)' : 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>💡 Pista</button>
              {(intentos >= 2 || l.dificultad === 'avanzado') && !answered && (
                <button onClick={nextLesson} style={{ background: 'transparent', border: '1px solid rgba(100,116,139,0.4)', borderRadius: 9, padding: '8px 15px', color: 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem', opacity: 0.8 }} title="Podés continuar sin completar esta lección">Saltar →</button>
              )}
              {curIdx > 0 && (
                <button onClick={() => goToLesson(curIdx - 1)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 15px', color: 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>← Anterior</button>
              )}
              {answered && (
                <button onClick={nextLesson} style={{ background: 'var(--green)', color: '#0a2417', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem' }}>
                  {curIdx < lecciones.length - 1 ? 'Siguiente →' : '🏆 Ver resumen'}
                </button>
              )}
            </div>

            {hintOpen && (
              <div style={{ marginTop: 11, background: 'rgba(232,168,56,0.045)', border: '1px solid rgba(232,168,56,0.16)', borderRadius: 9, padding: '11px 14px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--amber)', marginBottom: 4 }}>Pista</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--sub)' }}>{l.pista}</div>
              </div>
            )}

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
    <div style={{ background: 'rgba(8,9,13,0.88)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', padding: '0 12px', height: 52, display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, zIndex: 100 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', color: 'var(--sub)', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>←</button>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--nova)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{mod}</div>
        <div style={{ fontSize: 'clamp(0.76rem, 2.8vw, 0.88rem)', fontWeight: 600, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--sub)', fontFamily: 'DM Mono', flexShrink: 0 }}>{prog}</div>
    </div>
  )
}

function BottomBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ background: 'rgba(8,9,13,0.95)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(8px)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 11, position: 'sticky', bottom: 0, zIndex: 50 }}>
      <div style={{ fontSize: '0.74rem', color: 'var(--sub)', whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
        <div className="level-fill" style={{ height: '100%', borderRadius: 4, width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--nova)', fontFamily: 'DM Mono', flexShrink: 0 }}>{pct}%</div>
    </div>
  )
}
