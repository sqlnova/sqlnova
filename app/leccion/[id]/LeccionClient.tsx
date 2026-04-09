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

  const insertToken = (token: string) => {
    setQueryText((prev) => {
      const space = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
      return prev + space + token;
    });
  };

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

        const exact = uRows === sRows && uCols === sCols
        const normMatch = normalize(q) === normalize(l.solucion)
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
      fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.8,
      background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.5)',
      borderRadius: '0 10px 10px 0', padding: '14px 16px', marginBottom: 18,
      textAlign: 'justify' as const,
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title={slide.titulo} module="Módulo 0 · Introducción" prog={`${curSlide + 1} / ${total}`} onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 20px)', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 0' }}>
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
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--nova)', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sub)', lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Mono', fontSize: '0.78rem', color: 'var(--sub)', lineHeight: 1.8 }}>
                    <span style={{ color: '#475569' }}>-- Pregunta en lenguaje natural:</span><br/>
                    <span style={{ color: 'var(--sub)' }}>¿Cuáles son mis clientes de Buenos Aires que gastaron más de $10.000?</span><br/><br/>
                    <span style={{ color: '#475569' }}>-- Misma pregunta en SQL:</span><br/>
                    <span style={{ color: 'var(--nova)' }}>SELECT</span><span style={{ color: 'var(--text)' }}> nombre, email </span>
                    <span style={{ color: 'var(--nova)' }}>FROM</span><span style={{ color: '#a78bfa' }}> clientes </span>
                    <span style={{ color: 'var(--nova)' }}>WHERE</span><span style={{ color: 'var(--text)' }}> ciudad = </span>
                    <span style={{ color: 'var(--green)' }}>'Buenos Aires'</span>
                    <span style={{ color: 'var(--nova)' }}> AND</span><span style={{ color: 'var(--text)' }}> gasto_total </span>
                    <span style={{ color: 'var(--green)' }}>&gt; </span><span style={{ color: 'var(--amber)' }}>10000</span><span style={{ color: '#475569' }}>;</span>
                  </div>
                </div>
              )}
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
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={subtituloStyle}>{slide.subtitulo}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {curSlide > 0 && (
                  <button onClick={() => setCurSlide(s => s - 1)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '9px 16px', color: 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>← Anterior</button>
                )}
                <button onClick={isLast ? finishIntro : () => setCurSlide(s => s + 1)} style={{ background: isLast ? 'var(--green)' : 'var(--nova2)', color: isLast ? '#0a2417' : '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>
                  {isLast ? 'Empezar Módulo 1 →' : 'Siguiente →'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <BottomBar label={`Slide ${curSlide + 1} de ${total}`} pct={pct} />
      </div>
    )
  }

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
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 26px) clamp(14px, 4vw, 20px)', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.8, textAlign: 'justify' }}>
            Las <strong>Window Functions</strong> calculan valores sobre un conjunto de filas relacionadas <strong>sin eliminar filas del resultado</strong>. A diferencia de GROUP BY que colapsa las filas en una por grupo, las window functions agregan una columna calculada a cada fila existente.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {concepts.map(c => (
              <div key={c.nombre} style={{ background: 'var(--card)', border: `1px solid ${c.color}30`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: `${c.color}15`, padding: '8px 14px', borderBottom: `1px solid ${c.color}20` }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', fontWeight: 700, color: c.color }}>{c.nombre}</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 8, textAlign: 'justify' }}>{c.desc}</div>
                  <div style={{ background: 'var(--bg2)', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--green)' }}>{c.ej}</div>
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

  if (vista === 'intro-subqueries') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Cómo funciona una Subquery" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px,4vw,26px) clamp(14px,4vw,20px)', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.8, textAlign: 'justify' }}>
            Una <strong>subquery</strong> es un SELECT dentro de otro SELECT. SQL la ejecuta primero y usa su resultado en el query principal. Son como preguntas anidadas: primero respondés la de adentro, luego la de afuera.
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 16 }}>Estructura y flujo de ejecución</div>
            <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '16px', fontFamily: 'DM Mono', fontSize: '0.8rem', lineHeight: 2, marginBottom: 16 }}>
              <span style={{ color: 'var(--nova)' }}>SELECT</span><span style={{ color: 'var(--text)' }}> nombre </span>
              <span style={{ color: 'var(--nova)' }}>FROM</span><span style={{ color: '#a78bfa' }}> pacientes</span><br/>
              <span style={{ color: 'var(--nova)' }}>WHERE</span><span style={{ color: 'var(--text)' }}> medico_id </span>
              <span style={{ color: 'var(--nova)' }}>IN</span><span style={{ color: 'var(--text)' }}> (</span>
              <span style={{ color: 'var(--amber)' }}> ← query externo</span><br/>
              <span style={{ color: 'var(--text)' }}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span style={{ color: 'var(--nova)' }}>SELECT</span><span style={{ color: 'var(--text)' }}> id </span>
              <span style={{ color: 'var(--nova)' }}>FROM</span><span style={{ color: '#a78bfa' }}> medicos</span><br/>
              <span style={{ color: 'var(--text)' }}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span style={{ color: 'var(--nova)' }}>WHERE</span><span style={{ color: 'var(--text)' }}> experiencia </span>
              <span style={{ color: 'var(--green)' }}>&gt; </span><span style={{ color: 'var(--amber)' }}>5</span>
              <span style={{ color: 'var(--green)' }}> ← subquery (se ejecuta primero)</span><br/>
              <span style={{ color: 'var(--text)' }}>)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['1', 'var(--amber)', 'SQL ejecuta la subquery interna', 'SELECT id FROM medicos WHERE experiencia > 5 → [1, 3, 5]'],
                ['2', 'var(--nova)', 'Usa el resultado en el WHERE externo', 'WHERE medico_id IN (1, 3, 5)'],
                ['3', 'var(--green)', 'Devuelve las filas que coinciden', 'Los pacientes de esos médicos'],
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

          <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }

  if (vista === 'intro-ctes') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Cómo funcionan los CTEs" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px,4vw,26px) clamp(14px,4vw,20px)', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.8, textAlign: 'justify' }}>
            Un <strong>CTE</strong> (Common Table Expression) es una consulta con nombre que definís antes del SELECT principal. Se comporta como una tabla temporal que solo existe durante esa consulta. Son la forma más limpia de organizar queries complejos.
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: 14 }}>Un solo CTE</div>
            <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '16px', fontFamily: 'DM Mono', fontSize: '0.8rem', lineHeight: 2, marginBottom: 14 }}>
              <span style={{ color: 'var(--green)' }}>-- 1. Definís el CTE con un nombre</span><br/>
              <span style={{ color: 'var(--nova)' }}>WITH</span><span style={{ color: 'var(--amber)' }}> grandes_envios </span><span style={{ color: 'var(--nova)' }}>AS</span><span style={{ color: 'var(--text)' }}> (</span><br/>
              <span style={{ color: 'var(--text)' }}>&nbsp;&nbsp;</span><span style={{ color: 'var(--nova)' }}>SELECT</span><span style={{ color: 'var(--text)' }}> * </span><span style={{ color: 'var(--nova)' }}>FROM</span><span style={{ color: '#a78bfa' }}> envios </span><span style={{ color: 'var(--nova)' }}>WHERE</span><span style={{ color: 'var(--text)' }}> peso_kg </span><span style={{ color: 'var(--green)' }}>&gt; </span><span style={{ color: 'var(--amber)' }}>50</span><br/>
              <span style={{ color: 'var(--text)' }}>)</span><br/>
              <span style={{ color: 'var(--green)' }}>-- 2. Lo usás como si fuera una tabla</span><br/>
              <span style={{ color: 'var(--nova)' }}>SELECT</span><span style={{ color: 'var(--text)' }}> * </span><span style={{ color: 'var(--nova)' }}>FROM</span><span style={{ color: 'var(--amber)' }}> grandes_envios</span>
            </div>
          </div>

          <button onClick={() => { setVista('leccion'); setCurIdx(0) }} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
            Empezar las lecciones →
          </button>
        </div>
      </div>
    )
  }

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
            <clipPath id="clip-inner">
              <circle cx="125" cy="60" r="45"/>
            </clipPath>
            <circle cx="75" cy="60" r="45" fill="rgba(59,130,246,0.5)" clipPath="url(#clip-inner)"/>
            <text x="55" y="64" textAnchor="middle" fill="var(--sub)" fontSize="9" fontFamily="monospace">A</text>
            <text x="145" y="64" textAnchor="middle" fill="var(--sub)" fontSize="9" fontFamily="monospace">B</text>
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
            <clipPath id="clip-left">
              <circle cx="125" cy="60" r="45"/>
            </clipPath>
            <circle cx="75" cy="60" r="45" fill="rgba(16,185,129,0.5)" clipPath="url(#clip-left)"/>
            <text x="55" y="64" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" fontWeight="700">A</text>
            <text x="145" y="64" textAnchor="middle" fill="var(--sub)" fontSize="9" fontFamily="monospace">B</text>
          </svg>
        ),
      },
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Tipos de JOIN" module={getModuloLabel()} prog="Intro" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 26px) clamp(14px, 4vw, 20px)', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.8, textAlign: 'justify' }}>
            Un <strong>JOIN</strong> combina filas de dos tablas basándose en una columna relacionada.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {joins.map(j => (
              <div key={j.nombre} style={{ background: 'var(--card)', border: `1px solid ${j.color}30`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: j.colorBg, borderBottom: `1px solid ${j.color}20`, padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', fontWeight: 700, color: j.color }}>{j.nombre}</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ marginBottom: 10 }}>{j.svg}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 8, textAlign: 'justify' }}>{j.desc}</div>
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

  if (vista === 'resumen' && resumen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Resumen del módulo" module={getModuloLabel()} prog="✓ Completado" onBack={() => router.replace('/dashboard')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 20px)', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
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
                <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.5 }}>{p}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => router.replace('/dashboard')} style={{ background: 'var(--green)', color: '#0a2417', border: 'none', borderRadius: 9, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem', marginLeft: 'auto' }}>Volver al inicio →</button>
          </div>
        </div>
      </div>
    )
  }

  if (vista === 'glosario') {
    const filtrado = glosario.filter(g =>
      g.termino.toLowerCase().includes(glosarioSearch.toLowerCase()) ||
      g.descripcion.toLowerCase().includes(glosarioSearch.toLowerCase())
    )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <TopBar title="Glosario" module={getModuloLabel()} prog={`${glosario.length} términos`} onBack={() => setVista('leccion')} />
        <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 20px)', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
          <input
            value={glosarioSearch}
            onChange={e => setGlosarioSearch(e.target.value)}
            placeholder="Buscar término..."
            style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.9rem', outline: 'none', marginBottom: 16 }}
          />
          {filtrado.map((g) => (
            <div key={g.termino} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.9rem', fontWeight: 700, color: 'var(--nova)' }}>{g.termino}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 10 }}>{g.descripcion}</div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--green)' }}>{g.ejemplo}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const TABLAS_JOIN: Record<string, string[]> = {
    '05-11': ['transacciones', 'cuentas'], '05-12': ['transacciones', 'cuentas'],
    '06-01': ['medicos', 'consultas'], '06-03': ['consultas', 'medicos'], '06-04': ['medicos', 'consultas'],
    '03-01': ['pedidos', 'clientes'], '03-02': ['pedidos', 'clientes'], '03-03': ['pedidos', 'clientes', 'productos']
  }

  const PREVIEW: Record<string, { cols: string[]; rows: any[][] }> = {
    peliculas: { cols: ['id','titulo','genero','anio','calificacion'], rows: [[1,'Galaxia Perdida','Ciencia Ficción',2021,8.3],[2,'El Último Tango','Drama',2019,7.1]] },
    clientes: { cols: ['id','nombre','email','ciudad'], rows: [[1,'Martina Rodríguez','martina@mail.com','Buenos Aires'],[2,'Pablo García','pablo@mail.com','Córdoba']] },
    pedidos: { cols: ['id','cliente_id','producto_id','total','estado'], rows: [[1,1,1,85000,'completado']] },
    productos: { cols: ['id','nombre','categoria','precio','stock'], rows: [[1,'Notebook Pro','Electrónica',85000,15]] },
    medicos: { cols: ['id','nombre','especialidad','anios_experiencia'], rows: [[1,'Dr. Carlos Méndez','Cardiología',15]] },
    consultas: { cols: ['id','paciente_id','medico_id','diagnostico','costo'], rows: [[1,1,1,'Hipertensión controlada',4500]] },
    transacciones: { cols: ['id','cuenta_id','tipo','monto','estado'], rows: [[1,1,'debito',1500,'aprobada']] },
    cuentas: { cols: ['cuenta_id','titular','email','tipo_cuenta','saldo'], rows: [[1,'Lucía Fernández','lucia@banco.com','caja_ahorro',18500]] }
  }

  const badgeColor = { escribir: 'var(--green)', completar: 'var(--nova)', debugging: 'var(--amber)' }[l.tipo]
  const badgeBg = { escribir: 'rgba(62,207,142,0.09)', completar: 'rgba(77,166,255,0.09)', debugging: 'rgba(232,168,56,0.09)' }[l.tipo]
  const badgeLabel = { escribir: 'Escribir desde cero', completar: 'Completar el query', debugging: 'Debugging' }[l.tipo]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <TopBar title={l.titulo} module={getModuloLabel()} prog={`${curIdx + 1} / ${total}`} onBack={() => router.replace('/dashboard')} />

      <div style={{ flex: 1, padding: '26px 20px', maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {lecciones.map((lec, i) => (
            <button
              key={lec.id}
              onClick={() => goToLesson(i)}
              style={{
                minWidth: 28, height: 28, borderRadius: 7, border: 'none',
                background: i === curIdx ? 'var(--nova2)' : prog[lec.id]?.completada ? 'rgba(62,207,142,0.15)' : 'var(--bg3)',
                color: i === curIdx ? '#fff' : prog[lec.id]?.completada ? 'var(--green)' : 'var(--sub)',
                fontSize: '0.75rem', fontWeight: i === curIdx ? 700 : 400, cursor: 'pointer', fontFamily: 'DM Mono', flexShrink: 0
              }}
            >
              {prog[lec.id]?.completada && i !== curIdx ? '✓' : i + 1}
            </button>
          ))}
        </div>

        <div style={{ background: 'rgba(77,166,255,0.06)', borderLeft: '3px solid rgba(77,166,255,0.6)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 18, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.8, textAlign: 'justify' }}
          dangerouslySetInnerHTML={{ __html: l.teoria }} />

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '13px 17px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 5, background: badgeBg, color: badgeColor }}>{badgeLabel}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--sub)', marginLeft: 'auto' }}>+<strong style={{ color: 'var(--green)' }}>{l.xp}</strong> XP</span>
          </div>

          <div style={{ padding: '18px 17px' }}>
            <div style={{ fontSize: '0.97rem', fontWeight: 500, lineHeight: 1.6, marginBottom: 15, color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: l.enunciado.replace(/\n/g, '<br/>') }} />

            {(() => {
              const tablaNames = TABLAS_JOIN[l.id] || [l.tabla]
              return (
                <>
                  <div onClick={() => setDataOpen(!dataOpen)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: 'var(--sub)', cursor: 'pointer', marginBottom: 12, padding: '4px 9px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7 }}>
                    📋 Ver tablas: {tablaNames.map((t, i) => <span key={t}><strong style={{ color: 'var(--nova)' }}>{t}</strong>{i < tablaNames.length - 1 ? ' + ' : ''}</span>)} {dataOpen ? '▴' : '▾'}
                  </div>
                  {dataOpen && (
                    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {tablaNames.map(tName => (
                        <div key={tName}>
                          <div style={{ fontFamily: 'DM Mono', fontSize: '0.68rem', color: 'var(--nova)', fontWeight: 700, marginBottom: 4 }}>{tName.toUpperCase()}</div>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.72rem' }}>
                              <thead><tr>{PREVIEW[tName]?.cols.map(c => <th key={c} style={{ padding: '6px 9px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--sub)' }}>{c}</th>)}</tr></thead>
                              <tbody>{PREVIEW[tName]?.rows.map((row, ri) => <tr key={ri}>{row.map((v, ci) => <td key={ci} style={{ padding: '5px 9px', border: '1px solid var(--border)' }}>{v ?? 'NULL'}</td>)}</tr>)}</tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}

            {l.tipo === 'completar' ? (
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.88rem', lineHeight: 2.4, padding: '13px 15px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 11, marginBottom: 13 }}>
                {l.template?.split('___').map((part, i) => (
                  <span key={i}>{part}{i < (l.blanks?.length || 0) && (
                    <input value={blanks[i] || ''} onChange={e => { const nb = [...blanks]; nb[i] = e.target.value; setBlanks(nb) }}
                      style={{ background: 'rgba(77,166,255,0.08)', border: '1px dashed var(--nova)', borderRadius: 5, color: 'var(--nova)', padding: '2px 7px', minWidth: 68, outline: 'none' }} />
                  )}</span>
                ))}
              </div>
            ) : (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 11, overflow: 'hidden', marginBottom: 13 }}>
                <div style={{ background: 'var(--bg3)', padding: '6px 11px', borderBottom: '1px solid var(--border)', fontSize: '0.61rem', color: 'var(--dim)' }}>query.sql</div>
                
                {/* SQL Quick Tokens Bar */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', scrollbarWidth: 'none' }} className="no-scrollbar">
                  {[
                    { label: 'SELECT', color: 'var(--nova)' }, { label: '*', color: 'var(--text)' },
                    { label: 'FROM', color: 'var(--nova)' }, { label: 'WHERE', color: 'var(--nova)' },
                    { label: 'GROUP BY', color: 'var(--nova)' }, { label: '=', color: 'var(--green)' },
                    { label: 'AND', color: 'var(--nova)' }, { label: 'COUNT()', color: 'var(--amber)' }
                  ].map((token) => (
                    <button key={token.label} onClick={() => insertToken(token.label)}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'DM Mono', color: token.color, whiteSpace: 'nowrap' }}>
                      {token.label}
                    </button>
                  ))}
                </div>

                <textarea className="sql-editor" value={queryText} onChange={e => setQueryText(e.target.value)}
                  style={{ minHeight: 120, width: '100%', resize: 'vertical', background: 'transparent', color: 'inherit', border: 'none', padding: '10px', outline: 'none', fontFamily: 'DM Mono' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={runQuery} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600 }}>▶ Ejecutar</button>
              <button onClick={() => setHintOpen(!hintOpen)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 15px', color: hintOpen ? 'var(--amber)' : 'var(--sub)' }}>💡 Pista</button>
              {answered && <button onClick={nextLesson} style={{ background: 'var(--green)', color: '#0a2417', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, marginLeft: 'auto' }}>Siguiente →</button>}
            </div>
            {hintOpen && <div style={{ marginTop: 11, background: 'rgba(232,168,56,0.05)', border: '1px solid rgba(232,168,56,0.2)', borderRadius: 9, padding: '11px 14px', fontSize: '0.83rem', color: 'var(--sub)' }}>{l.pista}</div>}
          </div>
        </div>
      </div>
      <BottomBar label={`Lección ${curIdx + 1} de ${total}`} pct={pct} />
    </div>
  )
}

function TopBar({ title, module, prog, onBack }: any) {
  return (
    <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', padding: '0 12px', height: 52, display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, zIndex: 100 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', color: 'var(--sub)' }}>←</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--nova)', fontWeight: 600, textTransform: 'uppercase' }}>{module}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>{prog}</div>
    </div>
  )
}

function BottomBar({ label, pct }: any) {
  return (
    <div style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 11, position: 'sticky', bottom: 0, zIndex: 50 }}>
      <div style={{ fontSize: '0.74rem', color: 'var(--sub)' }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--nova)', width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--nova)', fontFamily: 'DM Mono' }}>{pct}%</div>
    </div>
  )
}
