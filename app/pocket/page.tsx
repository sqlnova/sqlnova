'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import Papa from 'papaparse'

// --- DATOS DEL GLOSARIO ---
const GLOSARIO = [
  { cat: 'Agregación', funcs: [
    { n: 'COUNT(*)', d: 'Cuenta el total de filas.' },
    { n: 'SUM(col)', d: 'Suma los valores de una columna.' },
    { n: 'AVG(col)', d: 'Promedio de una columna.' },
    { n: 'MAX/MIN', d: 'Valor máximo o mínimo.' }
  ]},
  { cat: 'Strings (Texto)', funcs: [
    { n: 'UPPER(col)', d: 'Convierte a mayúsculas.' },
    { n: 'LOWER(col)', d: 'Convierte a minúsculas.' },
    { n: 'SUBSTR(col, start, len)', d: 'Corta una parte del texto.' },
    { n: 'REPLACE(col, "a", "b")', d: 'Reemplaza texto.' }
  ]},
  { cat: 'Matemática', funcs: [
    { n: 'ABS(x)', d: 'Valor absoluto.' },
    { n: 'ROUND(x, dec)', d: 'Redondea a N decimales.' },
    { n: 'CAST(col AS INT)', d: 'Convierte texto a número entero.' }
  ]},
  { cat: 'Fecha y Hora', funcs: [
    { n: 'DATE("now")', d: 'Fecha actual.' },
    { n: 'STRFTIME("%Y", col)', d: 'Extrae el año de una fecha (YYYY-MM-DD).' }
  ]}
]

export default function PocketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [esPremium, setEsPremium] = useState(false)
  const [tablas, setTablas] = useState<{nombre: string, columnas: string[]}[]>([])
  const [query, setQuery] = useState('')
  const [resultado, setResultado] = useState<{ columns: string[], values: any[][] } | null>(null)
  const [error, setError] = useState('')
  const [showGlosario, setShowGlosario] = useState(false)
  
  const dbRef = useRef<any>(null)

  // Función para refrescar el menú lateral directamente desde la DB
  const actualizarEsquema = () => {
    if (!dbRef.current) return;
    try {
      const res = dbRef.current.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      if (res.length > 0) {
        const tableNames = res[0].values.map((v: any[]) => v[0] as string);
        const nuevasTablas = tableNames.map((tName) => {
          const pragma = dbRef.current.exec(`PRAGMA table_info("${tName}")`);
          let columnas: string[] = [];
          if (pragma.length > 0) {
            columnas = pragma[0].values.map((v: any[]) => v[1] as string);
          }
          return { nombre: tName, columnas };
        });
        setTablas(nuevasTablas);
      } else {
        setTablas([]);
      }
    } catch (e) {}
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      
      const { data: p } = await sb.from('perfiles').select('es_premium').eq('id', session.user.id).single()
      if (!p?.es_premium) { 
        setEsPremium(false)
        setLoading(false)
        return 
      }
      
      setEsPremium(true)

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
      
      dbRef.current = new SQL.Database()
      setLoading(false)
    }
    init()
  }, [router])

  const procesarCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !dbRef.current) return
    setError('')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase(),
      complete: (results) => {
        try {
          const nombreTabla = file.name.replace(/\.[^/.]+$/, "").trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()
          const columnas = Object.keys(results.data[0] as object)
          dbRef.current.run(`DROP TABLE IF EXISTS "${nombreTabla}"`)
          dbRef.current.run(`CREATE TABLE "${nombreTabla}" (${columnas.map(c => `"${c}" TEXT`).join(', ')});`)
          const sqlInsert = `INSERT INTO "${nombreTabla}" VALUES (${columnas.map(() => '?').join(', ')});`
          results.data.forEach((fila: any) => {
            const valores = Object.values(fila).map(v => typeof v === 'string' ? v.trim() : v)
            dbRef.current.run(sqlInsert, valores)
          })
          
          actualizarEsquema() // Actualizamos el panel
          setQuery(`SELECT * FROM ${nombreTabla} LIMIT 10;`)
        } catch (err: any) { setError(err.message) }
      }
    })
  }

  const ejecutarSQL = () => {
    if (!dbRef.current || !query.trim()) return
    setError(''); setResultado(null)
    try {
      const res = dbRef.current.exec(query)
      if (res.length > 0) {
        setResultado(res[0])
      } else {
        const q = query.trim().toUpperCase()
        if (/^(CREATE|DROP|ALTER|INSERT|UPDATE|DELETE)/.test(q)) {
          setResultado({ columns: ['✓ Éxito'], values: [['Operación ejecutada correctamente.']] })
        } else {
          setError("Query ejecutada sin resultados.")
        }
      }
      actualizarEsquema() // Actualizamos el panel post ejecución
    } catch (err: any) { setError(err.message) }
  }

  const descargarCSV = () => {
    if (!resultado) return
    const csv = Papa.unparse({ fields: resultado.columns, data: resultado.values })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", "resultado_sqlnova.csv")
    link.click()
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]"><div className="w-8 h-8 border-2 border-[var(--border2)] border-t-blue-500 rounded-full animate-spin" /></div>

  if (!esPremium) return <Paywall router={router} />

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Header */}
      <div className="h-[56px] border-b border-[var(--border)] flex items-center px-4 justify-between bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => router.replace('/dashboard')} className="text-[var(--sub)]">←</button>
          <h1 className="font-bold text-sm">🗄️ Pocket Database</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGlosario(true)} className="text-[10px] bg-[var(--bg3)] border border-[var(--border)] px-3 py-1.5 rounded-lg font-bold text-[var(--text)]">💡 GLOSARIO</button>
          {resultado && resultado.columns[0] !== '✓ Éxito' && (
            <button onClick={descargarCSV} className="text-[10px] bg-blue-600/20 text-blue-500 border border-blue-600/30 px-3 py-1.5 rounded-lg font-bold">📥 DESCARGAR</button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg3)] mb-6 transition-colors">
                <span className="text-2xl mb-1">📤</span>
                <span className="text-[10px] font-bold text-[var(--sub)] uppercase text-center">Subir CSV</span>
                <input type="file" accept=".csv" onChange={procesarCSV} className="hidden" />
              </label>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-[var(--sub)] uppercase tracking-widest">Estructura (Schema)</h3>
                <button onClick={actualizarEsquema} className="text-[10px] text-[var(--sub)] hover:text-[var(--text)]">↻</button>
              </div>

              <div className="space-y-4">
                {tablas.length === 0 && (
                  <div className="text-[10px] text-[var(--sub)] text-center py-4 border border-dashed border-[var(--border)] rounded-lg">No hay tablas todavía.</div>
                )}
                {tablas.map(t => (
                  <div key={t.nombre} className="bg-[var(--bg2)] p-3 rounded-lg border border-[var(--border)]">
                    <div className="text-xs font-bold text-blue-500 mb-2">📁 {t.nombre}</div>
                    {t.columnas.map(col => (
                      <div key={col} className="flex justify-between items-center text-[10px] py-1 border-b border-[var(--border)] last:border-0">
                        <span className="text-[var(--text)] font-mono">{col}</span>
                        <span className="text-[var(--sub)] italic">TEXT</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <textarea 
                className="w-full bg-transparent p-5 text-sm font-mono text-[var(--text)] outline-none min-h-[250px] lg:min-h-[400px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí tu query SQL..."
              />
              <div className="p-4 bg-[var(--bg2)] border-t border-[var(--border)] flex justify-end">
                <button onClick={ejecutarSQL} className="bg-blue-600 text-white text-xs font-bold px-8 py-3 rounded-lg active:scale-95 transition-all">▶ EJECUTAR SQL</button>
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-mono">⚠️ {error}</div>}

            {resultado && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead><tr className="bg-[var(--bg3)]">{resultado.columns.map(col => (<th key={col} className={`p-3 border-b border-[var(--border)] uppercase ${col === '✓ Éxito' ? 'text-green-500' : 'text-blue-500'}`}>{col}</th>))}</tr></thead>
                  <tbody>{resultado.values.map((fila, i) => (<tr key={i} className="hover:bg-[var(--bg2)]">{fila.map((val, j) => (<td key={j} className="p-3 border-b border-[var(--border)] text-[var(--text)]">{val !== null ? String(val) : <span className="text-[var(--sub)]">NULL</span>}</td>))}</tr>))}</tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Glosario */}
      {showGlosario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg3)]">
              <h2 className="font-bold text-[var(--text)]">💡 Glosario de Funciones SQL</h2>
              <button onClick={() => setShowGlosario(false)} className="text-[var(--sub)] hover:text-[var(--text)] text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {GLOSARIO.map(cat => (
                <div key={cat.cat}>
                  <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">{cat.cat}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.funcs.map(f => (
                      <div key={f.n} className="bg-[var(--bg2)] p-3 rounded-lg border border-[var(--border)]">
                        <div className="font-mono text-xs text-[var(--text)] mb-1">{f.n}</div>
                        <div className="text-[10px] text-[var(--sub)] leading-relaxed">{f.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Paywall({ router }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] p-6 text-center">
      <div className="bg-blue-500/10 p-6 rounded-3xl mb-5 border border-blue-500/20"><span className="text-6xl">💎</span></div>
      <h2 className="text-2xl font-extrabold mb-3 text-[var(--text)] tracking-tight">Pocket Database Premium</h2>
      <p className="text-[var(--sub)] max-w-md mb-10 text-sm leading-relaxed">Subí tus CSV, cruzá datos y descargá reportes. Privacidad total: nada se sube a la nube.</p>
      <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all">Volver al Dashboard</button>
    </div>
  )
}
