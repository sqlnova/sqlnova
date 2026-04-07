import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-blue-500 hover:underline text-sm font-bold">← Volver al inicio</Link>
        
        <h1 className="text-3xl font-extrabold mb-8">Términos y Condiciones</h1>
        
        <p className="text-[var(--sub)]">Última actualización: Abril de 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Aceptación de los Términos</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            Al acceder y utilizar SQLNova, aceptás cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2. Uso de la Plataforma</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            SQLNova es una herramienta educativa. Te comprometés a utilizar la plataforma de manera responsable, no intentar vulnerar la seguridad del sitio, ni utilizar bots o scripts automatizados para alterar el sistema de puntuación (XP) o el Leaderboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3. Cuentas Premium</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            Ciertas funcionalidades de la plataforma (como la Pocket Database) pueden estar reservadas para usuarios con nivel Premium. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del servicio en cualquier momento.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4. Limitación de Responsabilidad</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            SQLNova se proporciona &quot;tal cual&quot;. No garantizamos que el servicio sea ininterrumpido o libre de errores. No nos hacemos responsables por la pérdida de datos o interrupciones en el servicio.
          </p>
        </section>
      </div>
    </div>
  )
}
