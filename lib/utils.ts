// Normaliza una query SQL para comparaciones flexibles
export const normalize = (q: string) =>
  q.replace(/;$/, '').replace(/\s+/g, ' ').trim().toUpperCase()

// Verifica si dos conjuntos de columnas son equivalentes (orden-insensible)
export const sameColumns = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false
  const setA = new Set(a.map(c => c.toLowerCase()))
  return b.every(c => setA.has(c.toLowerCase()))
}

const SQLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2'

// Carga sql.js una sola vez y cachea la instancia en window
export async function loadSqlJs(): Promise<any> {
  const w = window as any
  if (w._sqljsReady && w._sqljsInstance) return w._sqljsInstance
  if (w._sqljsPromise) return w._sqljsPromise

  const promise = (async () => {
    if (!document.querySelector(`script[src*="sql-wasm.js"]`)) {
      const script = document.createElement('script')
      script.src = `${SQLJS_CDN}/sql-wasm.js`
      document.head.appendChild(script)
      await new Promise(resolve => { script.onload = resolve })
    }
    const instance = await w.initSqlJs({
      locateFile: (f: string) => `${SQLJS_CDN}/${f}`,
    })
    w._sqljsInstance = instance
    w._sqljsReady = true
    return instance
  })()

  w._sqljsPromise = promise
  return promise
}
