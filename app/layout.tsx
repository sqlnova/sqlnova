import '@/app/globals.css'
import type { Metadata, Viewport } from 'next'
import ThemeHandler from './ThemeHandler'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'SQLNova',
  description: 'Plataforma interactiva para dominar SQL con lecciones y retos diarios.',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png', // ESTO OBLIGA AL IPHONE A USAR EL LOGO
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SQLNova',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeHandler />
        <main className="min-h-screen pt-safe pb-safe bg-[var(--bg)]">
          {children}
        </main>
      </body>
    </html>
  )
}
