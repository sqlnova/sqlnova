'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import Papa from 'papaparse'

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
  
  // ESTO FALTABA DEFINIR BIEN:
  const [tablePreview, setTablePreview] = useState<{name: string, data: {columns: string[], values: any[][]}} | null>(null)
  
  const dbRef = useRef<any>(null)

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

  const openTablePreview = (t: string) => {
    if (!dbRef.current) return;
    if (tablePreview?.name === t) {
      setTablePreview(null);
      return;
    }
    try {
      const res = dbRef.current.exec(`SELECT * FROM "${t}" LIMIT 5`);
      if (res.length > 0) {
        setTablePreview({ name: t, data: res[0] });
      } else {
        setTablePreview({ name: t, data: { columns: ['Info'], values: [['Tabla vacía']] } });
      }
    } catch(e) {}
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
          
          actualizarEsquema()
          setQuery(`SELECT * FROM ${nombreTabla} LIMIT 10;`)
        } catch (err: any) { setError(err.message) }
      }
    })
  }

  const ejecutarSQL = () => {
    if (!dbRef.current || !query.trim()) return
    setError(''); setResultado(null); setTablePreview(null);
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
      actualizarEsquema()
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
                    <div 
                      className="text-xs font-bold text-blue-500 mb-2 flex justify-between items-center cursor-pointer"
                      onClick={() => openTablePreview(t.nombre)}
                    >
                      <span>📁 {t.nombre}</span>
                      <span className="text-[9px] font-normal text-[var(--sub)] border border-[var(--border)] px-1.5 rounded">
                        {tablePreview?.name === t.nombre ? 'Ocultar' : 'Ver datos'}
                      </span>
                    </div>
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

          <main className="flex-1 min-w-0 space-y-4">
            {/* PREVIEW UI */}
            {tablePreview && (
              <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl overflow-hidden mb-4">
                <div className="bg-[var(--bg3)] padding p-3 border-b border-[var(--border)] flex justify-between items-center">
                  <span className="text-xs font-mono color text-[var(--nova)] font-bold">🔍 {tablePreview.name} (Primeras 5 filas)</span>
                  <button onClick={() => setTablePreview(null)} className="text-[var(--sub)] cursor-pointer">✕</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[10px]">
                    <thead><tr>{tablePreview.data.columns.map(col => <th key={col} className="p-2 border-b border-[var(--border)] text-[var(--sub)]">{col}</th>)}</tr></thead>
                    <tbody>{tablePreview.data.values.map((row, i) => <tr key={i} className="hover:bg-[var(--bg3)]">{row.map((val, j) => <td key={j} className="p-2 border-b border-[var(--border)] text-[var(--text)]">{val !== null ? String(val) : 'NULL'}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <textarea 
                className="w-full bg-transparent p-5 text-sm font-mono text-[var(--text)] outline-none min-h-[250px] lg:min-h-[400px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí tu
