import '@/app/globals.css'
import type { Metadata, Viewport } from 'next'
import ThemeHandler from './ThemeHandler' // Esto es un pequeño ayudante que crearemos ahora

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', 
}

export const metadata: Metadata = {
  title: 'SQLNova - Aprende SQL Jugando',
  description: 'Plataforma interactiva para dominar SQL con lecciones y retos diarios.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SQLNova',
  },
  themeColor: '#08090d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        {/* Este pequeño script evita que la pantalla parpadee en negro al entrar */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const tema = localStorage.getItem('sqlnova-tema') || 'oscuro';
              document.documentElement.setAttribute('data-theme', tema);
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className="antialiased selection:bg-blue-500/20">
        {/* ThemeHandler se encarga de hablar con Supabase sin romper tu diseño */}
        <ThemeHandler />
        
        <main className="min-h-screen pt-safe pb-safe">
          {children}
        </main>
      </body>
    </html>
  )
}
