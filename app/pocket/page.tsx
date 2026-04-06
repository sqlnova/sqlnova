'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import Papa from 'papaparse'

export default function PocketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [esPremium, setEsPremium] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [tablas, setTablas] = useState<{nombre: string, columnas: string[]}[]>([])
  const [query, setQuery] = useState('')
  const [resultado, setResultado] = useState<{ columns: string[], values: any[][] } | null>(null)
  const [error, setError] = useState('')
  
  const dbRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      setUser(session.user)

      const { data: p } = await sb.from('perfiles').select('es_premium').eq('id', session.user.id).single()
      
      if (!p?.es_premium) {
        setEsPremium(false)
        setLoading(false)
        return
      }

      setEsPremium(true)

      const SQL = (window as any)._sqljsInstance || (await (window as any)._sqljsPromise)
      if (SQL) {
        dbRef.current = new SQL.Database()
      }
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
          if (results.data.length === 0) throw new Error("Archivo vacío")
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
        } catch (err: any) {
          setError(err.message)
        }
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
    <div className="flex items-center justify-center min-h-screen bg-[#08090d]"><div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" /></div>
  )

  if (!esPremium) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#08090d] p-6 text-center">
      <div className="bg-blue-500/10 p-6 rounded-3xl mb-5 border border-blue-500/20"><span className="text-6xl">💎</span></div>
      <h2 className="text-2xl font-extrabold mb-3 text-white">Pocket Database <span className="text-blue-400">Premium</span></h2>
      <p className="text-slate-400 max-w-md mb-8 text-sm">Analizá tus propios CSV con SQL. Privacidad total: nada se sube al servidor.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mb-10">
        <BenefitCard icon="🔒" title="Privacidad" desc="Datos procesados solo en tu RAM." />
        <BenefitCard icon="📊" title="SQL Libre" desc="Usá JOINs, Group By y más." />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={() => router.push('/dashboard')} className="flex-1 bg-white/5 text-slate-400 py-3 rounded-xl font-bold">Volver</button>
        <button className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20">Hacerme Premium ✨</button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#08090d]">
      <div className="h-[52px] border-b border-white/5 flex items-center px-4 gap-3 sticky top-0 bg-[#08090d]/80 backdrop-blur-md z-50">
        <button onClick={() => router.replace('/dashboard')} className="p-2 text-slate-400">←</button>
        <h1 className="font-bold text-sm text-white">🗄️ Pocket Database</h1>
      </div>

      <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Layout: Columna en movil, Fila en escritorio */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="bg-[#12141c] border border-white/5 rounded-xl p-5">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors mb-6">
                <span className="text-2xl mb-1">📤</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subir CSV</span>
                <input type="file" accept=".csv" onChange={procesarCSV} className="hidden" />
              </label>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Tablas cargadas</h3>
              <div className="space-y-4">
                {tablas.length === 0 && <p className="text-xs text-slate-600 italic">No hay tablas.</p>}
                {tablas.map(t => (
                  <div key={t.nombre}>
                    <div className="text-xs font-bold text-blue-400">📁 {t.nombre}</div>
                    <div className="text-[10px] text-slate-500 ml-5 mt-1 leading-relaxed">{t.columnas.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-[#12141c] border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between">
                <span className="text-[10px] font-mono text-slate-400">sandbox_explorador.sql</span>
                <span className="text-[10px] text-blue-400 font-bold">LOCAL RAM</span>
              </div>
              <textarea 
                className="w-full bg-transparent p-5 text-sm font-mono text-slate-300 outline-none min-h-[250px] lg:min-h-[400px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí tu query..."
              />
              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                <button onClick={ejecutarSQL} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-8 py-3 rounded-lg transition-all active:scale-95">
                  ▶ Ejecutar Query
                </button>
              </div>
            </div>

            {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">⚠️ {error}</div>}

            {resultado && (
              <div className="mt-6">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Resultado ({resultado.values.length} filas)</div>
                <div className="bg-[#12141c] border border-white/5 rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead><tr className="bg-white/5">{resultado.columns.map(col => (<th key={col} className="p-3 border-b border-white/5 text-blue-400 uppercase">{col}</th>))}</tr></thead>
                    <tbody>{resultado.values.map((fila, i) => (<tr key={i} className="hover:bg-white/[0.02]">{fila.map((val, j) => (<td key={j} className="p-3 border-b border-white/[0.02] text-slate-400">{val}</td>))}</tr>))}</tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function BenefitCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-[#12141c] border border-white/5 p-4 rounded-2xl text-left">
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-xs font-bold text-white mb-1 uppercase tracking-wide">{title}</div>
      <div className="text-[11px] text-slate-500 leading-normal">{desc}</div>
    </div>
  )
}
