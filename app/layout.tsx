import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SQLNova — Aprendé SQL jugando',
  description: 'Lecciones cortas. Racha diaria. Sandbox con tus propios datos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
