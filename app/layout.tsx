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
  title: 'SQLNova - Aprende SQL Jugando',
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
