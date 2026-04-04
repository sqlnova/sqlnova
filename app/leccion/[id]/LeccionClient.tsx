'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { LECCIONES_M1, INTRO_SLIDES, DATASET_SQL } from '@/lib/curriculum'

type Prog = Record<string, { completada: boolean; xp_ganado: number }>

export default function LeccionClient({ moduloId }: { moduloId: number }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [prog, setProg] = useState<Prog>({})
  const [curIdx, setCurIdx] = useState(0)
  const [curSlide, setCurSlide] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [dataOpen, setDataOpen] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [blanks, setBlanks] = useState<string[]>([])
  const [result, setResult] = useState<{ columns: string[]; values: any[][] } | null>(null)
  const [resultError, setResultError] = useState('')
  const [loading, setLoading] = useState(true)
  const sqlDbRef = useRef<any>(null)

  // Init
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

      // Load sql.js only for lesson modules
      if (moduloId !== 0) {
        const SQL = await (window as any).initSqlJs({
          locateFile: (f: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
        })
        const db = new SQL.Database()
        db.run(DATASET_SQL)
        sqlDbRef.current = db
      }

      // Set starting lesson index
      if (moduloId === 1) {
        const done = Object.keys(pm).filter(k => k.startsWith('01-') && pm[k]?.completada).length
        setCurIdx(Math.min(done, LECCIONES_M1.length - 1))
      }

      setLoading(false)
    }
    setup()
  }, [moduloId, router])

  // Reset state when lesson changes
  useEffect(() => {
    setAnswered(false)
    setHintOpen(false)
    setDataOpen(false)
    setResult(null)
    setResultError('')
    setQueryText('')
    if (moduloId === 1 && LECCIONES_M1[curIdx]) {
      const l = LECCIONES_M1[curIdx]
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

    await sb.from('perfiles').update({
      xp_total: (perfil?.xp_total || 0) + xp,
      ultima_actividad: new Date().toISOString().split('T')[0]
    }).eq('id', user.id)

    setPerfil((prev: any) => ({ ...prev, xp_total: (prev?.xp_total || 0) + xp }))
    setProg(prev => ({ ...prev, [lid]: { completada: true, xp_ganado: xp } }))
  }

  const getQuery = () => {
    const l = LECCIONES_M1[curIdx]
    if (l.tipo === 'completar' && l.template && l.blanks) {
      let q = l.template
      blanks.forEach(b => { q = q.replace('___', b) })
      return q
    }
    return queryText
  }

  const normalize = (q: string) => q.replace(/;$/, '').replace(/\s+/g, ' ').trim().toUpperCase()

  const runQuery = async () => {
    const l = LECCIONES_M1[curIdx]
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
    if (curIdx < LECCIONES_M1.length - 1) {
      setCurIdx(prev => prev + 1)
      window.scrollTo(0, 0)
    } else {
      router.replace('/dashboard')
    }
  }

  const finishIntro = async () => {
    const slides = ['00-01','00-02','00-03','00-04','00-05','00-06','00-07']
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

  // INTRO MODULE
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

              {(slide.tipo === 'tabla' || slide.tipo === 'resumen') && slide.tipo !== 'resumen' && (
                <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.76rem' }}>
                    <thead>
                      <tr>{TABLA_COLS.map(c => (
                        <th key={c} style={{ padding: '7px 10px', border: '1px solid var(--border)', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: (slide as any).hlCols ? 'rgba(77,166,255,0.12)' : 'var(--bg3)', color: (slide as any).hlCols ? 'var(--nova)' : 'var(--sub)' }}>{c}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {TABLA_ROWS.map((row, ri) => (
                        <tr key={ri}>{row.map((v, ci) => (
                          <td key={ci} style={{ padding: '6px 10px', border: '1px solid var(--border)', background: ri === (slide as any).hlRow ? 'rgba(62,207,142,0.07)' : 'rgba(255,255,255,0.01)', color: ri === (slide as any).hlRow ? 'var(--green)' : 'var(--text)' }}>{String(v)}</td>
                        ))}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {slide.tipo === 'resumen' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                  {[['🗄','Base de datos','El contenedor general','var(--amber)'],['📋','Tabla','Datos del mismo tipo','var(--nova)'],['⬇','Columna','Un tipo de dato','var(--green)'],['➡','Fila','Un registro completo','var(--red)']].map(([ico,t,d,c]) => (
                    <div key={t} style={{ background: 'var(--bg2)', border: `1px solid ${c}40`, borderRadius: 10, padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.3rem', marginBottom: 8 }}>{ico}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: c, marginBottom: 4 }}>{t}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{d}</div>
                    </div>
                  ))}
                </div>
              )}

              {slide.tipo === 'svg' && (
                <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 20, marginBottom: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🗄️</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--sub)' }}>Una colección organizada de información</div>
                </div>
              )}
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--sub)', lineHeight: 1.7, background: 'rgba(77,166,255,0.04)', borderLeft: '2px solid rgba(77,166,255,0.32)', borderRadius: '0 8px 8px 0', padding: '12px 14px', marginBottom: 18 }}>
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
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === curSlide ? 'var(--nova)' : 'var(--bg3)' }} />
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

  // LESSON MODULE 1
  if (moduloId !== 1) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '2rem' }}>🚧</div>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Módulo próximamente disponible</div>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>← Volver al dashboard</button>
      </div>
    )
  }

  const l = LECCIONES_M1[curIdx]
  const total = LECCIONES_M1.length
  const pct = Math.round(((curIdx + 1) / total) * 100)

  const PREVIEW: Record<string, { cols: string[]; rows: any[][] }> = {
    peliculas: {
      cols: ['id', 'titulo', 'genero', 'anio', 'calificacion'],
      rows: [[1,'Galaxia Perdida','Ciencia Ficción',2021,8.3],[2,'El Último Tango','Drama',2019,7.1],[3,'Risa Sin Fin','Comedia',2022,6.5]]
    },
    series: {
      cols: ['id', 'titulo', 'genero', 'temporadas', 'calificacion'],
      rows: [[1,'El Imperio Caído','Drama',4,9.2],[2,'Detectives del Sur','Crimen',2,8.0]]
    }
  }

  const pv = PREVIEW[l.tabla] || PREVIEW.peliculas
  const badgeColor = { escribir: 'var(--green)', completar: 'var(--nova)', debugging: 'var(--amber)' }[l.tipo]
  const badgeBg = { escribir: 'rgba(62,207,142,0.09)', completar: 'rgba(77,166,255,0.09)', debugging: 'rgba(232,168,56,0.09)' }[l.tipo]
  const badgeLabel = { escribir: 'Escribir desde cero', completar: 'Completar el query', debugging: 'Debugging' }[l.tipo]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <TopBar title={l.titulo} module="Módulo 1 · SELECT & Básicos" prog={`${curIdx + 1} / ${total}`} onBack={() => router.replace('/dashboard')} />

      <div style={{ flex: 1, padding: '26px 20px', maxWidth: 800, margin: '0 auto', width: '100%', animation: 'fadeUp 0.28s ease both' }}>
        {/* Theory */}
        <div style={{ background: 'rgba(77,166,255,0.045)', borderLeft: '2px solid rgba(77,166,255,0.38)', borderRadius: '0 9px 9px 0', padding: '13px 16px', marginBottom: 18, fontSize: '0.87rem', color: 'var(--sub)', lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: l.teoria }} />

        {/* Exercise card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 15, overflow: 'hidden', marginBottom: 16 }}>
          {/* Header */}
          <div style={{ padding: '13px 17px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 5, background: badgeBg, color: badgeColor }}>{badgeLabel}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--sub)', marginLeft: 'auto' }}>+<strong style={{ color: 'var(--green)' }}>{l.xp}</strong> XP</span>
          </div>

          <div style={{ padding: '18px 17px' }}>
            <div style={{ fontSize: '0.97rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.55, marginBottom: 15 }}>
              {l.enunciado.split('\n').map((line, i) => <span key={i}>{line}{i < l.enunciado.split('\n').length - 1 && <br />}</span>)}
            </div>

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

            {/* Editor */}
            {l.tipo === 'completar' && l.template && l.blanks ? (
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.88rem', lineHeight: 2.4, padding: '13px 15px', background: '#0b0d14', border: '1px solid var(--border2)', borderRadius: 11, marginBottom: 13 }}>
                {l.template.split('___').map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < (l.blanks?.length || 0) && (
                      <input
                        value={blanks[i] || ''}
                        onChange={e => { const nb = [...blanks]; nb[i] = e.target.value; setBlanks(nb) }}
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
                />
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={runQuery} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem' }}>▶ Ejecutar</button>
              <button onClick={() => setHintOpen(!hintOpen)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 15px', color: hintOpen ? 'var(--amber)' : 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>💡 Pista</button>
              {answered && (
                <button onClick={nextLesson} style={{ background: 'var(--green)', color: '#0a2417', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem' }}>
                  {curIdx < LECCIONES_M1.length - 1 ? 'Siguiente →' : '🏆 Finalizar módulo'}
                </button>
              )}
            </div>

            {/* Hint */}
            {hintOpen && (
              <div style={{ marginTop: 11, background: 'rgba(232,168,56,0.045)', border: '1px solid rgba(232,168,56,0.16)', borderRadius: 9, padding: '11px 14px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--amber)', marginBottom: 4 }}>Pista</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--sub)' }}>{l.pista}</div>
              </div>
            )}

            {/* Result */}
            {(result || resultError) && (
              <div style={{ marginTop: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                  <span style={{ fontSize: '0.77rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: resultError ? 'rgba(229,83,75,0.09)' : 'rgba(62,207,142,0.09)', color: resultError ? 'var(--red)' : 'var(--green)', border: `1px solid ${resultError ? 'rgba(229,83,75,0.22)' : 'rgba(62,207,142,0.22)'}` }}>
                    {resultError ? '✗ Error' : '✓ Correcto'}
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

            {/* Success */}
            {answered && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 15, background: 'rgba(62,207,142,0.05)', border: '1px solid rgba(62,207,142,0.18)', borderRadius: 12, padding: '15px 17px' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--green)', marginBottom: 2 }}>¡Correcto!</div>
                  <div style={{ fontSize: '0.79rem', color: 'var(--sub)' }}>
                    {prog[l.id]?.completada && !result ? 'Ya habías completado esta lección.' : '¡Excelente! Tu respuesta es correcta.'}
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
