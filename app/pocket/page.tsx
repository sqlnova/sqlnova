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

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      const { data: p } = await sb.from('perfiles').select('es_premium').eq('id', session.user.id).single()
      if (!p?.es_premium) { setEsPremium(false); setLoading(false); return }
      setEsPremium(true)
      const SQL = (window as any)._sqljsInstance || (await (window as any)._sqljsPromise)
      if (SQL) dbRef.current = new SQL.Database()
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
          setTablas(prev => [...prev, { nombre: nombreTabla, columnas }])
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
      if (res.length > 0) setResultado(res[0])
      else setError("Query ejecutada sin resultados.")
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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#08090d]"><div className="w-8 h-8 border-2 border-t-blue-500 rounded-full animate-spin" /></div>

  if (!esPremium) return <Paywall router={router} />

  return (
    <div className="flex flex-col min-h-screen bg-[#08090d] text-white">
      {/* Header */}
      <div className="h-[56px] border-b border-white/5 flex items-center px-4 justify-between bg-[#08090d]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => router.replace('/dashboard')} className="text-slate-400">←</button>
          <h1 className="font-bold text-sm">🗄️ Pocket Database</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGlosario(true)} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-bold hover:bg-white/10">💡 GLOSARIO</button>
          {resultado && (
            <button onClick={descargarCSV} className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600/30">📥 DESCARGAR</button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] space-y-4">
            <div className="bg-[#12141c] border border-white/5 rounded-xl p-5">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 mb-6">
                <span className="text-2xl mb-1">📤</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Subir CSV</span>
                <input type="file" accept=".csv" onChange={procesarCSV} className="hidden" />
              </label>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Estructura (Schema)</h3>
              <div className="space-y-4">
                {tablas.map(t => (
                  <div key={t.nombre} className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <div className="text-xs font-bold text-blue-400 mb-2">📁 {t.nombre}</div>
                    {t.columnas.map(col => (
                      <div key={col} className="flex justify-between items-center text-[10px] py-1 border-b border-white/[0.03] last:border-0">
                        <span className="text-slate-300 font-mono">{col}</span>
                        <span className="text-slate-600 italic">TEXT</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-4">
            <div className="bg-[#12141c] border border-white/5 rounded-xl overflow-hidden">
              <textarea 
                className="w-full bg-transparent p-5 text-sm font-mono text-slate-300 outline-none min-h-[250px] lg:min-h-[400px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí tu query SQL..."
              />
              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                <button onClick={ejecutarSQL} className="bg-blue-600 text-white text-xs font-bold px-8 py-3 rounded-lg active:scale-95 transition-all">▶ EJECUTAR SQL</button>
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">⚠️ {error}</div>}

            {resultado && (
              <div className="bg-[#12141c] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead><tr className="bg-white/5">{resultado.columns.map(col => (<th key={col} className="p-3 border-b border-white/10 text-blue-400 uppercase">{col}</th>))}</tr></thead>
                  <tbody>{resultado.values.map((fila, i) => (<tr key={i} className="hover:bg-white/[0.02]">{fila.map((val, j) => (<td key={j} className="p-3 border-b border-white/[0.02] text-slate-400">{val}</td>))}</tr>))}</tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Glosario */}
      {showGlosario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141c] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="font-bold">💡 Glosario de Funciones SQL</h2>
              <button onClick={() => setShowGlosario(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {GLOSARIO.map(cat => (
                <div key={cat.cat}>
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">{cat.cat}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.funcs.map(f => (
                      <div key={f.n} className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="font-mono text-xs text-white mb-1">{f.n}</div>
                        <div className="text-[10px] text-slate-400 leading-relaxed">{f.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white/5 text-center text-[10px] text-slate-500 italic">
              Nota: Este Sandbox utiliza el motor SQLite. La sintaxis es 99% compatible con MySQL/Postgres.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Paywall({ router }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#08090d] p-6 text-center">
      <div className="bg-blue-500/10 p-6 rounded-3xl mb-5 border border-blue-500/20"><span className="text-6xl">💎</span></div>
      <h2 className="text-2xl font-extrabold mb-3 text-white tracking-tight">Pocket Database Premium</h2>
      <p className="text-slate-400 max-w-md mb-10 text-sm leading-relaxed">Subí tus CSV, cruzá datos y descargá reportes. Privacidad total: nada se sube a la nube.</p>
      <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">Volver al Dashboard</button>
    </div>
  )
}
