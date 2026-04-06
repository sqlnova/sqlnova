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

      // 1. Verificar si es Premium
      const { data: p } = await sb.from('perfiles').select('es_premium').eq('id', session.user.id).single()
      
      if (!p?.es_premium) {
        setEsPremium(false)
        setLoading(false)
        return
      }

      setEsPremium(true)

      // 2. Esperar al motor SQL (que ya precargamos en el Layout)
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
          
          // Crear tabla en RAM
          const sqlCreate = `CREATE TABLE "${nombreTabla}" (${columnas.map(c => `"${c}" TEXT`).join(', ')});`
          dbRef.current.run(sqlCreate)

          // Insertar datos
          const sqlInsert = `INSERT INTO "${nombreTabla}" VALUES (${columnas.map(() => '?').join(', ')});`
          results.data.forEach((fila: any) => {
            dbRef.current.run(sqlInsert, Object.values(fila))
          })

          setTablas(prev => [...prev, { nombre: nombreTabla, columnas }])
        } catch (err: any) {
          setError("Error al procesar el archivo: " + err.message)
        }
      }
    })
  }

  const ejecutarSQL = () => {
    if (!dbRef.current || !query.trim()) return
    setError('')
    try {
      const res = dbRef.current.exec(query)
      if (res.length > 0) {
        setResultado(res[0])
      } else {
        setResultado(null)
        setError("Query ejecutada. No hubo resultados que mostrar.")
      }
    } catch (err: any) {
      setError(err.message)
      setResultado(null)
    }
  }

  if (loading) return <div className="loader">Cargando...</div>

  // PANTALLA PARA NO PREMIUM (PAYWALL)
if (!esPremium) return (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '80vh', 
    padding: '20px', 
    textAlign: 'center',
    animation: 'fadeUp 0.5s ease both'
  }}>
    <div style={{ 
      background: 'rgba(77,166,255,0.1)', 
      padding: '24px', 
      borderRadius: '24px', 
      marginBottom: '20px',
      border: '1px solid var(--border2)'
    }}>
      <span style={{ fontSize: '4rem' }}>💎</span>
    </div>

    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.03em' }}>
      Desbloqueá tu <span style={{ color: 'var(--nova)' }}>Pocket Database</span>
    </h2>
    
    <p style={{ color: 'var(--sub)', maxWidth: '450px', lineHeight: '1.6', marginBottom: '32px' }}>
      Llevá tus habilidades de SQL al mundo real. Analizá tus propios datos sin que salgan de tu computadora.
    </p>

    {/* Grilla de Beneficios */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '12px', 
      maxWidth: '600px', 
      width: '100%',
      marginBottom: '40px' 
    }}>
      <BenefitCard icon="🔒" title="Privacidad Total" desc="Los archivos nunca se suben a la nube." />
      <BenefitCard icon="📊" title="Análisis Libre" desc="Cruza múltiples CSV con JOINs." />
      <BenefitCard icon="⚡" title="WASM Engine" desc="Velocidad nativa en tu navegador." />
      <BenefitCard icon="📁" title="Exportar" desc="Descargá tus reportes en un click." />
    </div>

    <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
      <button 
        onClick={() => router.push('/dashboard')}
        style={{ flex: 1, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--sub)', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
      >
        Volver
      </button>
      <button 
        style={{ flex: 2, background: 'var(--nova2)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(45, 143, 255, 0.3)' }}
      >
        Hacerme Premium ✨
      </button>
    </div>
  </div>
)

// Sub-componente para los beneficios
function BenefitCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '16px', textAlign: 'left' }}>
      <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--sub)', lineHeight: '1.4' }}>{desc}</div>
    </div>
  )
}

  return (
    <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem' }}>🗄️ Pocket Database</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--sub)' }}>Los datos se procesan en tu RAM. Nada se sube al servidor.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Sidebar: Tablas */}
        <aside style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <label style={{ display: 'block', padding: '10px', border: '2px dashed var(--border2)', borderRadius: 8, textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <span style={{ fontSize: '0.8rem' }}>+ Cargar CSV</span>
            <input type="file" accept=".csv" onChange={procesarCSV} style={{ display: 'none' }} />
          </label>
          
          <h3 style={{ fontSize: '0.75rem', color: 'var(--sub)', textTransform: 'uppercase', marginBottom: 12 }}>Tus Tablas</h3>
          {tablas.map(t => (
            <div key={t.nombre} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--nova)' }}>📁 {t.nombre}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--dim)', marginLeft: 18 }}>{t.columnas.join(', ')}</div>
            </div>
          ))}
        </aside>

        {/* Main: Query & Resultados */}
        <main>
          <textarea 
            className="sql-editor" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM nombre_de_tu_archivo LIMIT 10;"
          />
          <button onClick={ejecutarSQL} style={{ marginTop: 12, background: 'var(--nova2)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Ejecutar Query
          </button>

          {error && <div style={{ color: 'var(--red)', marginTop: 12, fontSize: '0.85rem', fontFamily: 'DM Mono' }}>{error}</div>}

          {resultado && (
            <div style={{ marginTop: 24, overflowX: 'auto', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', fontFamily: 'DM Mono' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    {resultado.columns.map(col => <th key={col} style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {resultado.values.map((fila, i) => (
                    <tr key={i}>
                      {fila.map((val, j) => <td key={j} style={{ padding: 10, borderBottom: '1px solid var(--border)' }}>{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
