'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Revisamos si el usuario ya está logueado
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard') // Si ya tiene cuenta y está logueado, lo mandamos a sus lecciones
      } else {
        setCargando(false) // Si no está logueado (ej: Google), le mostramos esta página
      }
    })
  }, [router])

  // Mientras decide a dónde mandarlo, mostramos tu spinner original
  if (cargando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16, color: 'var(--text)' }}>
            SQL<span style={{ color: 'var(--nova)' }}>Nova</span>
          </div>
          <div style={{ width: 32, height: 32, border: '2px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </div>
    )
  }

  // LA PÁGINA PÚBLICA PARA GOOGLE Y USUARIOS NUEVOS
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans">
      
      <nav className="p-6 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="font-bold text-xl tracking-tighter text-[var(--text)]">
          SQL<span className="text-blue-500">Nova</span>
        </div>
        <Link href="/auth" className="text-sm font-bold bg-[var(--bg3)] hover:bg-[var(--border)] px-5 py-2.5 rounded-xl transition-all">
          Ingresar
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto">
        <div className="text-7xl mb-6 animate-bounce">🚀</div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-[var(--text)]">
          Dominá SQL de forma interactiva
        </h1>
        <p className="text-[var(--sub)] text-lg md:text-xl mb-10 leading-relaxed max-w-2xl">
          SQLNova es la plataforma gratuita para aprender bases de datos jugando. 
          Completá lecciones prácticas, resolvé retos diarios y competí en el ranking mundial.
        </p>

        <div className="bg-[var(--bg2)] border border-[var(--border)] p-6 rounded-2xl mb-10 text-left max-w-xl w-full shadow-lg">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-[var(--text)]">
            <span>🔒</span> ¿Por qué te pedimos iniciar sesión?
          </h3>
          <p className="text-sm text-[var(--sub)] leading-relaxed">
            Utilizamos tu cuenta (Google o Email) <strong>únicamente</strong> para crear tu perfil de estudiante, <strong>guardar tu progreso</strong> en los cursos y <strong>sumar tus puntos (XP)</strong> al Leaderboard semanal. No compartimos tu información con terceros.
          </p>
        </div>

        <Link href="/auth" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          Comenzar a aprender gratis
        </Link>
      </main>

      <footer className="p-8 text-center text-xs text-[var(--sub)] flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-[var(--border)]">
        <span>© 2026 SQLNova. Todos los derechos reservados.</span>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Política de Privacidad</Link>
          <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Términos de Servicio</Link>
          <Link href="/eliminar-cuenta" className="hover:text-[var(--text)] transition-colors">Eliminar cuenta</Link>
        </div>
      </footer>

    </div>
  )
}
