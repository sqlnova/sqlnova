import '@/app/globals.css'
import type { Metadata, Viewport } from 'next'

// --- CONFIGURACIÓN PARA IPHONE (SAFE AREAS & VIEWPORT) ---
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // ESTA LÍNEA ES CLAVE: Hace que la app use el Safe Area (no se corte con el Notch)
  viewportFit: 'cover', 
}

// --- METADATA PRINCIPAL Y ETIQUETAS DE APPLE ---
export const metadata: Metadata = {
  title: 'SQLNova - Aprende SQL Jugando',
  description: 'Plataforma interactiva para dominar SQL con lecciones y retos diarios.',
  
  // Etiquetas específicas para que iOS lo trate como una App Nativa
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default', // Cambia a 'black-translucent' si quieres que el contenido flote DETRÁS de la barrita de batería
    title: 'SQLNova',
  },
  
  // Color base por defecto para el navegador (sincronizado con modo oscuro)
  themeColor: '#08090d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // data-theme oscuro por defecto, el dashboard lo cambiará a claro si el perfil lo dice
    <html lang="es" data-theme="oscuro">
      <head>
        {/* Icono especial para Apple (Asegurate que el archivo existe en public/) */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased selection:bg-blue-500/20">
        
        {/* Usamos las variables de safe area que definimos en globals.css en el Layout general */}
        {/* Esto agrega el padding necesario arriba (pt-safe) y abajo (pb-safe) para el Notch y la barrita de inicio */}
        <main className="min-h-screen pt-safe pb-safe">
          {children}
        </main>
        
      </body>
    </html>
  )
}
