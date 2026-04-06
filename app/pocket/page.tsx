'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import Papa from 'papaparse'

export default function PocketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [esPremium, setEsPremium] = useState(false)
  const [tablas, setTablas] = useState<{nombre: string, columnas: string[]}[]>([])
  const [query, setQuery] = useState('')
  const [resultado, setResultado] = useState<{ columns: string[], values: any[][] } | null>(null)
  const [error, setError] = useState('')
  
  const dbRef = useRef<any>(null)

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
      complete: (results) => {
        try {
          const nombreTabla = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase()
          const columnas = Object.keys(results.data[0] as object)
          
          dbRef.current.run(`DROP TABLE IF EXISTS "${nombreTabla}"`)
          const sqlCreate = `CREATE TABLE "${nombreTabla}" (${columnas.map(c => `"${c}" TEXT`).join(', ')});`
          dbRef.current.run(sqlCreate)

          const sqlInsert = `INSERT INTO "${nombreTabla}" VALUES (${columnas.map(() => '?').join(', ')});`
          results.data.forEach((fila: any) => {
            dbRef.current.run(sqlInsert, Object.values(fila))
          })

          setTablas(prev => [...prev, { nombre: nombreTabla, columnas }])
          setQuery(`SELECT * FROM ${nombreTabla} LIMIT 10;`)
        } catch (err: any) {
          setError("Error: " + err.message)
        }
      }
    })
  }

  const ejecutarSQL = () => {
    if (!dbRef.current || !query.trim()) return
    setError('')
    setResultado(null)
    try {
      const res = dbRef.current.exec(query)
      if (res.length > 0) {
        setResultado(res[0])
      } else {
        setError("Query ejecutada sin resultados.")
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#08090d] gap-4">
      <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-xs text-slate-500 font-mono">Iniciando Sandbox...</span>
    </div>
  )

  if (!esPremium) return <div className="p-10 text-center">Contenido Premium 💎</div>

  return (
    <div className="flex flex-col min-h-screen bg-[#08090d]">
      {/* TopBar */}
      <div className="h-[52px] border-b border-white/5 flex items-center px-4 gap-3 sticky top-0 bg-[#08090d]/80 backdrop-blur-md z-50">
        <button onClick={() => router.replace('/dashboard')} className="p-2 text-slate-400">←</button>
        <h1 className="font-bold text-sm">🗄️ Pocket Database</h1>
      </div>

      <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Layout Adaptable: Columna en móvil, Fila en escritorio */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar de Tablas */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="bg-[#12141c] border border-white/5 rounded-xl p-5">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors mb-6">
                <span className="text-2xl mb-1">📤</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subir CSV</span>
                <input type="file" accept=".csv" onChange={procesarCSV} className="hidden" />
              </label>

              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Tus tablas locales</h3>
              <div className="space-y-4">
                {tablas.length === 0 && <p className="text-xs text-slate-600 italic">No hay tablas cargadas.</p>}
                {tablas.map(t => (
                  <div key={t.nombre} className="group">
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-2">📁 {t.nombre}</div>
                    <div className="text-[10px] text-slate-500 ml-5 mt-1 leading-relaxed">{t.columnas.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Editor y Resultados */}
          <main className="flex-1 min-w-0">
            <div className="bg-[#12141c] border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <span className="text-[10px] font-mono text-slate-400">editor_sandbox.sql</span>
                <span className="text-[10px] text-blue-400 font-bold">RAM MODE</span>
              </div>
              
              {/* EDITOR MÁS GRANDE */}
              <textarea 
                className="w-full bg-transparent p-5 text-sm font-mono text-slate-300 outline-none min-h-[220px] lg:min-h-[300px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí tu query aquí... (Ej: SELECT * FROM mi_tabla)"
              />
              
              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                <button 
                  onClick={ejecutarSQL}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all active:scale-95"
                >
                  ▶ Ejecutar SQL
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
                ⚠️ {error}
              </div>
            )}

            {/* TABLA DE RESULTADOS RESPONSIVA */}
            {resultado && (
              <div className="mt-6">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Resultado ({resultado.values.length} filas)</div>
                <div className="bg-[#12141c] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="bg-white/5">
                        {resultado.columns.map(col => (
                          <th key={col} className="p-3 border-b border-white/5 text-blue-400 uppercase tracking-wider">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.values.map((fila, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          {fila.map((val, j) => (
                            <td key={j} className="p-3 border-b border-white/[0.02] text-slate-400">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
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
