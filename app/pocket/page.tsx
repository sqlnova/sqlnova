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

      // 1. Verificar estado Premium
      const { data: p } = await sb.from('perfiles').select('es_premium').eq('id', session.user.id).single()
      
      if (!p?.es_premium) {
        setEsPremium(false)
        setLoading(false)
        return
      }

      setEsPremium(true)

      // 2. Inicializar motor SQL (WASM)
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
          if (results.data.length === 0) throw new Error("El archivo está vacío.")

          const nombreTabla = file.name
            .replace(/\.[^/.]+$/, "")
            .trim()
            .replace(/[^a-z0-9]/gi, '_') 
            .toLowerCase()

          const columnas = Object.keys(results.data[0] as object)
          
          dbRef.current.run(`DROP TABLE IF EXISTS "${nombreTabla}"`)
          const sqlCreate = `CREATE TABLE "${nombreTabla}" (${columnas.map(c => `"${c}" TEXT`).join(', ')});`
          dbRef.current.run(sqlCreate)

          const sqlInsert = `INSERT INTO "${nombreTabla}" VALUES (${columnas.map(() => '?').join(', ')});`
          results.data.forEach((fila: any) => {
            const valoresLimpios = Object.values(fila).map(v => typeof v === 'string' ? v.trim() : v)
            dbRef.current.run(sqlInsert, valoresLimpios)
          })

          setTablas(prev => [...prev, { nombre: nombreTabla, columnas }])
          setQuery(`SELECT * FROM ${nombreTabla} LIMIT 10;`)
        } catch (err: any) {
          setError("Error al procesar: " + err.message)
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

  // CONTENIDO PREMIUM (PAYWALL)
  if (!esPremium) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#08090d] p-6 text-center animate-fade-up">
      <div className="bg-blue-500/10 p-6 rounded-3xl mb-5 border border-blue-500/20">
        <span className="text-6xl">💎</span>
      </div>

      <h2 className="text-2xl lg:text-3xl font-extrabold mb-3 tracking-tight text-white">
        Desbloqueá tu <span className="text-blue-400">Pocket Database</span>
      </h2>
      
      <p className="text-slate-400 max-w-md leading-relaxed mb-8 text-sm lg:text-base">
        Llevá tus habilidades de SQL al mundo real. Analizá tus propios datos sin que salgan de tu computadora.
      </p>

      {/* Grilla de Beneficios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full mb-10">
        <BenefitCard icon="🔒" title="Privacidad Total" desc="Tus archivos nunca tocan el servidor." />
        <BenefitCard icon="📊" title="Análisis Libre" desc="Cruzá múltiples CSV con JOINs." />
        <BenefitCard icon="⚡" title="WASM Engine" desc="Velocidad nativa en tu navegador." />
        <BenefitCard icon="📁" title="Multi-Table" desc="Cargá todos los archivos que necesites." />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex-1 bg-white/5 border border-white/10 text-slate-400 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-all"
        >
          Volver
        </button>
        <button 
          onClick={() => alert('Próximamente: Integración con Lemon Squeezy')}
          className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95"
        >
          Hacerme Premium ✨
        </button>
      </div>
    </div>
  )

  // CONTENIDO PREMIUM ACTIVADO (SANDBOX)
  return (
    <div className="flex flex-col min-h-screen bg-[#08090d]">
      <div className="h-[52px] border-b border-white/5 flex items-center px-4 gap-3 sticky top-0 bg-[#08090d]/80 backdrop-blur-md z-50">
        <button onClick={() => router.replace('/dashboard')} className="p-2 text-slate-400">←</button>
        <h1 className="font-bold text-sm text-white">🗄️ Pocket Database</h1>
      </div>

      <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="bg-[#12141c] border border-white/5 rounded-xl p-5">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors mb-6">
                <span className="text-2xl mb-1">📤</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subir CSV</span>
                <input type="file" accept=".csv" onChange={procesarCSV} className="hidden" />
              </label>

              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Tablas en RAM</h3>
              <div className="space-y-4">
                {tablas.length === 0 && <p className="text-xs text-slate-600 italic">No hay datos cargados.</p>}
                {tablas.map(t => (
                  <div key={t.nombre}>
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-2">📁 {t.nombre}</div>
                    <div className="text-[10px] text-slate-500 ml-5 mt-1 leading-relaxed">{t.columnas.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-[#12141c] border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <span className="text-[10px] font-mono text-slate-400">sandbox_explorador.sql</span>
                <span className="text-[10px] text-blue-400 font-bold">MODO LOCAL</span>
              </div>
              
              <textarea 
                className="w-full bg-transparent p-5 text-sm font-mono text-slate-300 outline-none min-h-[220px] lg:min-h-[350px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí tu query... (Ej: SELECT * FROM ventas)"
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

function BenefitCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-[#12141c] border border-white/5 p-4 rounded-2xl text-left">
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-xs font-bold text-white mb-1 uppercase tracking-wide">{title}</div>
      <div className="text-[11px] text-slate-500 leading-normal">{desc}</div>
    </div>
  )
}
