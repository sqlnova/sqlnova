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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
      <div className="w-8 h-8 border-2 border-[var(--border2)] border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

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
        </div>
      </div>

      <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg2)] mb-6">
                <span className="text-2xl mb-1">📤</span>
                <span className="text-[10px] font-bold text-[var(--sub)] uppercase text-center">Subir CSV</span>
                <input type="file" accept=".csv" onChange={procesarCSV} className="hidden" />
              </label>
              <h3 className="text-[10px] font-bold text-[var(--sub)] uppercase tracking-widest mb-4">Tablas</h3>
              <div className="space-y-4">
                {tablas.map(t => (
                  <div key={t.nombre} className="bg-[var(--bg2)] p-3 rounded-lg border border-[var(--border)]">
                    <div className="text-xs font-bold text-blue-500 mb-2">📁 {t.nombre}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Editor */}
          <main className="flex-1 min-w-0 space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <textarea 
                className="w-full bg-transparent p-5 text-sm font-mono text-[var(--text)] outline-none min-h-[300px] resize-none"
                value={queryText}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM..."
              />
              <div className="p-4 bg-[var(--bg2)] border-t border-[var(--border)] flex justify-end">
                <button onClick={ejecutarSQL} className="bg-blue-600 text-white text-xs font-bold px-8 py-3 rounded-lg active:scale-95 transition-all">EJECUTAR</button>
              </div>
            </div>

            {resultado && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead><tr className="bg-[var(--bg3)]">{resultado.columns.map(col => (<th key={col} className="p-3 border-b border-[var(--border)] text-blue-500">{col}</th>))}</tr></thead>
                  <tbody>{resultado.values.map((fila, i) => (<tr key={i} className="border-b border-[var(--border)]">{fila.map((val, j) => (<td key={j} className="p-3 text-[var(--text)]">{String(val)}</td>))}</tr>))}</tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function Paywall({ router }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] p-6 text-center">
      <div className="bg-blue-500/10 p-6 rounded-3xl mb-5 border border-blue-500/20 text-5xl">💎</div>
      <h2 className="text-2xl font-extrabold mb-3 text-[var(--text)]">Pocket Database Premium</h2>
      <p className="text-[var(--sub)] max-w-md mb-10 text-sm">Subí tus propios datos y analizalos con SQL.</p>
      <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold">Volver</button>
    </div>
  )
}
