import '@/app/globals.css'
import type { Metadata, Viewport } from 'next'
import ThemeHandler from './ThemeHandler'

// Configuración del Viewport para dispositivos móviles (evita zoom molesto en inputs)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000', // Color de la barra del navegador
}

// Configuración de Metadata optimizada para Google (SEO)
export const metadata: Metadata = {
  metadataBase: new URL('https://app.sqlnova.app'),
  manifest: '/manifest.json',
  title: {
    default: 'SQLNova | Aprendé SQL Gratis de forma Interactiva',
    template: '%s | SQLNova'
  },
  description: 'Dominá bases de datos con lecciones prácticas, retos diarios y Pocket Database. La plataforma gratuita para aprender SQL jugando con tus propios datos.',
  keywords: ['SQL', 'Aprender SQL', 'Bases de datos', 'PostgreSQL', 'SQLite', 'Cursos de programación gratis', 'Data Science'],
  authors: [{ name: 'SQLNova Team' }],
  
  // Iconos para Navegadores y iPhone
  icons: {
    icon: [
      { url: '/favicon.ico' }, // El icono chiquito de pestaña
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },

  // Open Graph: Lo que se ve en Facebook, WhatsApp, LinkedIn
  openGraph: {
    title: 'SQLNova - Dominá SQL Jugando',
    description: 'Lecciones interactivas, ranking mundial y práctica real con tus propios archivos Excel y CSV. ¡Empezá gratis!',
    url: 'https://app.sqlnova.app',
    siteName: 'SQLNova',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // Imagen de 1200x630 que debés tener en /public
        width: 1200,
        height: 630,
        alt: 'Preview de la plataforma SQLNova',
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'SQLNova | Aprendé SQL Gratis',
    description: 'La forma más divertida de aprender bases de datos desde cero.',
    images: ['/og-image.png'],
  },

  // Configuración de Web App (PWA)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SQLNova',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Este tag ayuda a Google a verificar que sos la dueña si no lo hiciste por DNS */}
        <link rel="canonical" href="https://app.sqlnova.app" />
      </head>
      <body className="antialiased">
        {/* ThemeHandler maneja el modo oscuro/claro sin saltos visuales */}
        <ThemeHandler />
        
        {/* pt-safe y pb-safe aseguran que el contenido no se tape con el notch del iPhone */}
        <main className="min-h-screen pt-safe pb-safe bg-[var(--bg)]">
          {children}
        </main>
      </body>
    </html>
  )
}
