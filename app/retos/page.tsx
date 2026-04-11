'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import ShareRetoCard from '@/components/ShareRetoCard'

type Reto = {
  id: string
  fecha: string
  nivel: 'inicial' | 'avanzado' | 'experto'
  titulo: string
  enunciado: string
  pista: string
  solucion: string
  xp: number
  dataset_sql: string
}

type Completado = { reto_id: string; xp_ganado: number }

const NIVEL_COLOR = {
  inicial:  { bg: 'rgba(62,207,142,0.1)',  border: 'rgba(62,207,142,0.3)',  text: 'var(--green)', label: '⭐ Inicial' },
  avanzado: { bg: 'rgba(77,166,255,0.1)',  border: 'rgba(77,166,255,0.3)',  text: 'var(--nova)',  label: '⭐⭐ Avanzado' },
  experto:  { bg: 'rgba(232,168,56,0.1)', border: 'rgba(232,168,56,0.3)', text: 'var(--amber)', label: '⭐⭐⭐ Experto' },
}

const NIVEL_XP = { inicial: 15, avanzado: 30, experto: 50 }

export default function RetosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [retos, setRetos] = useState<Reto[]>([])
  const [completados, setCompletados] = useState<Completado[]>([])
  const [nivelActivo, setNivelActivo] = useState<'inicial' | 'avanzado' | 'experto'>('inicial')
  
  const [queryText, setQueryText] = useState('')
  const [result, setResult] = useState<{ columns: string[]; values: any[][] } | null>(null)
  const [resultError, setResultError] = useState('')
  
  const [hintOpen, setHintOpen] = useState(false)
  const [hintUsed, setHintUsed] = useState(false) // Nuevo estado anti-trampa
  
  const [tablas, setTablas] = useState<string[]>([])
  const [tablePreview, setTablePreview] = useState<{name: string, data: {columns: string[], values: any[][]}} | null>(null)

  const [answered, setAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [celebrating, setCelebrating] = useState(false)
  
  const sqlDbRef = useRef<any>(null)
  const dbInitRef = useRef(false)
  const [perfil, setPerfil] = useState<{ alias: string } | null>(null)
  const [showShare, setShowShare] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      setUser(session.user)
      const { data: perfilData } = await sb.from('perfiles').select('alias').eq('id', session.user.id).single()
      if (perfilData) setPerfil(perfilData)

      // Traer retos del día
      const { data: retosData } = await sb
        .from('retos')
        .select('*')
        .eq('fecha', hoy)
        .eq('activo', true)
        .order('nivel')

      if (retosData && retosData.length > 0) {
        setRetos(retosData)

        // Init sql.js con el dataset del reto
        const dataset = retosData[0].dataset_sql
        if (dataset && !dbInitRef.current) {
          dbInitRef.current = true
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
          db.run(dataset)
          sqlDbRef.current = db

          // Extraer nombres de tablas dinámicamente
          try {
            const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            if (res.length > 0) {
              setTablas(res[0].values.map((v: any[]) => v[0]));
            }
          } catch(e) {}
        }
      }

      // Traer completados del usuario
      const { data: compData } = await sb
        .from('retos_completados')
        .select('reto_id, xp_ganado')
        .eq('usuario_id', session.user.id)

      setCompletados(compData || [])
      setLoading(false)
    }
    load()
  }, [router, hoy])

  // Reset cuando cambia el nivel
  useEffect(() => {
    setQueryText('')
    setResult(null)
    setResultError('')
    setHintOpen(false)
    setHintUsed(false)
    setTablePreview(null)
    setAnswered(false)
    setShowShare(false)
  }, [nivelActivo])

  // Verificar si el nivel actual ya está completado
  const retoActual = retos.find(r => r.nivel === nivelActivo)
  const yaCompletado = retoActual ? completados.some(c => c.reto_id === retoActual.id) : false

  useEffect(() => {
    if (yaCompletado) setAnswered(true)
  }, [yaCompletado, nivelActivo])

  const normalize = (q: string) => q.replace(/;$/, '').replace(/\s+/g, ' ').trim().toUpperCase()

  const openTablePreview = (t: string) => {
    if (!sqlDbRef.current) return;
    if (tablePreview?.name === t) {
      setTablePreview(null); // Cerrar si ya está abierta
      return;
    }
    try {
      const res = sqlDbRef.current.exec(`SELECT * FROM ${t} LIMIT 5`);
      if (res.length > 0) {
        setTablePreview({ name: t, data: res[0] });
      } else {
        setTablePreview({ name: t, data: { columns: ['Info'], values: [['Tabla vacía']] } });
      }
    } catch(e) {}
  }

  const runQuery = async () => {
    if (!queryText.trim() || !sqlDbRef.current || !retoActual) return
    try {
      const res = sqlDbRef.current.exec(queryText.trim())
      if (!res.length) { setResult({ columns: [], values: [] }); setResultError(''); return }
      setResult(res[0])
      setResultError('')

      if (!answered) {
        const solRes = sqlDbRef.current.exec(retoActual.solucion)
        if (!solRes.length) return

        const uRows = JSON.stringify(res[0].values)
        const sRows = JSON.stringify(solRes[0].values)
        const sameColCount = res[0].columns.length === solRes[0].columns.length
        const flexMatch = uRows === sRows && sameColCount
        const normMatch = normalize(queryText) === normalize(retoActual.solucion)

        if (flexMatch || normMatch) {
          // Penalización: si usó pista, 0 XP
          const xpToAward = hintUsed ? 0 : retoActual.xp;

          const { data } = await sb.rpc('completar_reto', {
            p_usuario_id: user.id,
            p_reto_id: retoActual.id,
            p_xp: xpToAward,
            p_pista_usada: hintUsed,
          })
          
          if (data?.ok) {
            setAnswered(true)
            setCelebrating(true)
            setCompletados(prev => [...prev, { reto_id: retoActual.id, xp_ganado: xpToAward }])
            setTimeout(() => setCelebrating(false), 3000)
          }
        }
      }
    } catch (e: any) {
      setResultError(e.message)
      setResult(null)
    }
  }

  const totalXpHoy = completados
    .filter(c => retos.some(r => r.id === c.reto_id))
    .reduce((sum, c) => sum + c.xp_ganado, 0)

  const completadosHoy = completados.filter(c => retos.some(r => r.id === c.reto_id)).length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (retos.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <TopBar onBack={() => router.replace('/dashboard')} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ fontSize: '3rem' }}>🗓️</div>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>No hay retos para hoy</div>
        <div style={{ fontSize: '0.84rem', color: 'var(--sub)' }}>Volvé mañana para nuevos desafíos</div>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>← Volver</button>
      </div>
    </div>
  )

  const c = NIVEL_COLOR[nivelActivo]
  const currentCompleted = retoActual ? completados.find(c => c.reto_id === retoActual.id) : null;
  const finalXp = currentCompleted ? currentCompleted.xp_ganado : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1, background: 'var(--bg)', color: 'var(--text)' }}>
      <TopBar onBack={() => router.replace('/dashboard')} />

      <div style={{ flex: 1, padding: 'clamp(16px,4vw,24px) clamp(14px,4vw,20px)', maxWidth: 800, margin: '0 auto', width: '100%' }}>

        {/* Header del día */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--sub)', fontFamily: 'DM Mono', marginBottom: 4 }}>
            {new Date(hoy + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Retos del día</div>
          {completadosHoy > 0 && (
            <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--green)' }}>
              ✓ {completadosHoy}/3 completados · +{totalXpHoy} XP ganados hoy
            </div>
          )}
        </div>

        {/* Selector de nivel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
          {(['inicial', 'avanzado', 'experto'] as const).map(nivel => {
            const reto = retos.find(r => r.nivel === nivel)
            const cObj = reto ? completados.find(c => c.reto_id === reto.id) : null
            const done = !!cObj
            const earnedXp = cObj ? cObj.xp_ganado : NIVEL_XP[nivel]
            const col = NIVEL_COLOR[nivel]
            const activo = nivelActivo === nivel
            return (
              <button
                key={nivel}
                onClick={() => setNivelActivo(nivel)}
                style={{
                  background: activo ? col.bg : 'var(--card)',
                  border: `2px solid ${activo ? col.border : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: activo ? col.text : 'var(--sub)', marginBottom: 2 }}>{col.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--sub)', fontFamily: 'DM Mono' }}>
                  {done ? <span style={{ color: earnedXp > 0 ? 'var(--green)' : 'var(--amber)' }}>✓ +{earnedXp} XP</span> : `+${NIVEL_XP[nivel]} XP`}
                </div>
              </button>
            )
          })}
        </div>

        {/* Reto actual */}
        {retoActual && (
          <div style={{ background: 'var(--card)', border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ background: c.bg, padding: '12px 18px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, color: c.text, fontSize: '0.9rem' }}>{retoActual.titulo}</div>
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: c.text, fontWeight: 700 }}>+{retoActual.xp} XP</div>
            </div>

            <div style={{ padding: '18px' }}>
              {/* Enunciado */}
              <div style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 16, color: 'var(--text)' }}
                dangerouslySetInnerHTML={{ __html: retoActual.enunciado }} />

              {/* Tablas disponibles e Interactivas */}
              <div style={{ marginBottom: 14, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>Tablas:</span>
                {tablas.map(t => (
                  <button 
                    key={t} 
                    onClick={() => openTablePreview(t)}
                    style={{ 
                      fontSize: '0.72rem', fontFamily: 'DM Mono', 
                      background: tablePreview?.name === t ? 'var(--nova)' : 'var(--bg3)', 
                      padding: '4px 10px', borderRadius: 6, 
                      color: tablePreview?.name === t ? '#fff' : 'var(--nova)', 
                      border: '1px solid ' + (tablePreview?.name === t ? 'var(--nova)' : 'var(--border)'), 
                      cursor: 'pointer', transition: 'all 0.2s' 
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Previsualización de Tabla */}
              {tablePreview && (
                <div style={{ marginBottom: 14, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg3)', padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'DM Mono', color: 'var(--nova)', fontWeight: 700 }}>🔍 {tablePreview.name} (Primeras 5 filas)</span>
                    <button onClick={() => setTablePreview(null)} style={{ color: 'var(--sub)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.7rem' }}>
                      <thead><tr>{tablePreview.data.columns.map(col => <th key={col} style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', color: 'var(--sub)', textAlign: 'left', background: 'var(--bg2)' }}>{col}</th>)}</tr></thead>
                      <tbody>{tablePreview.data.values.map((row, i) => <tr key={i}>{row.map((val, j) => <td key={j} style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{val !== null ? String(val) : <span style={{color: 'var(--dim)'}}>NULL</span>}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Editor de Código Adaptable a Modo Claro/Oscuro */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ background: 'var(--bg3)', padding: '5px 10px', display: 'flex', gap: 5, borderBottom: '1px solid var(--border)' }}>
                  {['#ff5f57','#ffbd2e','#28c840'].map(col => <div key={col} style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />)}
                  <span style={{ fontFamily: 'DM Mono', fontSize: '0.6rem', color: 'var(--sub)', marginLeft: 4 }}>reto.sql</span>
                </div>
                <textarea
                  className="sql-editor"
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery() } }}
                  style={{ minHeight: 90, background: 'transparent', border: 'none', width: '100%' }}
                  placeholder="Escribí tu query acá..."
                  disabled={answered}
                />
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <button onClick={runQuery} disabled={answered} style={{ background: answered ? 'var(--bg3)' : 'var(--nova2)', color: answered ? 'var(--sub)' : '#fff', border: 'none', borderRadius: 9, padding: '9px 17px', fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontSize: '0.84rem' }}>▶ Ejecutar</button>
                <button onClick={() => { setHintOpen(!hintOpen); setHintUsed(true); }} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 14px', color: hintOpen ? 'var(--amber)' : 'var(--sub)', cursor: 'pointer', fontSize: '0.84rem' }}>💡 Pista</button>
              </div>

              {/* Pista */}
              {hintOpen && (
                <div style={{ marginBottom: 14, background: 'rgba(232,168,56,0.05)', border: '1px solid rgba(232,168,56,0.2)', borderRadius: 9, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pista (Recompensa: 0 XP)</div>
                  </div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.78rem', color: 'var(--sub)' }}>{retoActual.pista}</div>
                </div>
              )}

              {/* Resultado */}
              {(result || resultError) && (
                <div style={{ marginBottom: 14 }}>
                  {resultError ? (
                    <div style={{ fontFamily: 'DM Mono', fontSize: '0.78rem', color: 'var(--red)', background: 'rgba(229,83,75,0.05)', border: '1px solid rgba(229,83,75,0.16)', borderRadius: 8, padding: '9px 13px' }}>{resultError}</div>
                  ) : result && (
                    <div style={{ overflowX: 'auto' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sub)', marginBottom: 6, fontFamily: 'DM Mono' }}>{result.values.length} fila{result.values.length !== 1 ? 's' : ''}</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono', fontSize: '0.74rem' }}>
                        <thead><tr>{result.columns.map(col => <th key={col} style={{ padding: '5px 9px', border: '1px solid var(--border)', fontSize: '0.65rem', textTransform: 'uppercase', background: 'var(--bg3)', color: 'var(--nova)' }}>{col}</th>)}</tr></thead>
                        <tbody>{result.values.map((row, ri) => <tr key={ri}>{row.map((v, ci) => <td key={ci} style={{ padding: '5px 9px', border: '1px solid var(--border)', color: 'var(--text)' }}>{v !== null ? String(v) : <span style={{ color: 'var(--dim)' }}>NULL</span>}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Éxito */}
              {answered && (
                <div style={{ background: finalXp > 0 ? 'rgba(62,207,142,0.06)' : 'rgba(232,168,56,0.06)', border: `1px solid ${finalXp > 0 ? 'rgba(62,207,142,0.2)' : 'rgba(232,168,56,0.2)'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.5rem' }}>{celebrating ? '🎉' : '✅'}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: finalXp > 0 ? 'var(--green)' : 'var(--amber)', marginBottom: 2 }}>
                      {celebrating ? '¡Excelente! Reto completado' : 'Ya completaste este reto'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sub)' }}>
                      {finalXp > 0 ? `+${finalXp} XP sumados al leaderboard semanal` : 'Reto completado con ayuda (+0 XP)'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setShowShare(true)}
                      style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 8, padding: '8px 13px', color: '#06b6d4', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      📸 Compartir
                    </button>
                    {completadosHoy < 3 && (
                      <button
                        onClick={() => {
                          const niveles: ('inicial' | 'avanzado' | 'experto')[] = ['inicial', 'avanzado', 'experto']
                          const siguiente = niveles.find(n => n !== nivelActivo && !completados.some(c => c.reto_id === retos.find(r => r.nivel === n)?.id))
                          if (siguiente) setNivelActivo(siguiente)
                        }}
                        style={{ background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Siguiente →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Todos completados */}
        {completadosHoy === 3 && (
          <div style={{ marginTop: 16, background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.25)', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏆</div>
            <div style={{ fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>¡Completaste todos los retos de hoy!</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--sub)' }}>Ganaste {totalXpHoy} XP · Volvé mañana para nuevos desafíos</div>
          </div>
        )}
      </div>
      {showShare && retoActual && (
        <ShareRetoCard
          nivel={retoActual.nivel}
          enunciado={retoActual.enunciado}
          fecha={hoy}
          alias={perfil?.alias || user?.email?.split('@')[0] || 'Usuario'}
          xpGanado={finalXp}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', color: 'var(--sub)', fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}>←</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--nova)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SQLNova</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>⚡ Retos diarios</div>
      </div>
    </div>
  )
}
