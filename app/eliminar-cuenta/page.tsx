import Link from 'next/link'

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-blue-500 hover:underline text-sm font-bold">← Volver al inicio</Link>

        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--sub)]">SQLNova Support</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Solicitud de eliminación de cuenta y datos
          </h1>
          <p className="text-[var(--sub)] leading-relaxed">
            Si querés eliminar tu cuenta de SQLNova y los datos asociados, enviá un correo electrónico desde
            la dirección vinculada a tu cuenta para que podamos validar identidad y procesar la solicitud.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg2)] p-6 md:p-8 space-y-4 shadow-lg">
          <h2 className="text-xl font-bold">Cómo solicitar la eliminación</h2>

          <div className="space-y-2 text-[var(--sub)] leading-relaxed">
            <p>
              1. Enviá un mail a{' '}
              <a className="text-blue-400 hover:underline font-semibold" href="mailto:sqlnova@gmail.com">
                sqlnova@gmail.com
              </a>
              .
            </p>
            <p>
              2. Usá exactamente este asunto:{' '}
              <span className="text-[var(--text)] font-semibold">
                &quot;Eliminar datos de cuenta SQLNova&quot;
              </span>
              .
            </p>
            <p>3. Te vamos a confirmar la recepción y estado del pedido por el mismo correo.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg2)] p-6 md:p-8 space-y-3">
          <h2 className="text-lg font-bold">Alcance de la eliminación</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            Al confirmar tu solicitud, eliminaremos tu cuenta, tu progreso académico, puntajes de retos y datos
            personales asociados a SQLNova. Si necesitáramos conservar información mínima por razones legales o de
            seguridad, te lo informaremos de forma explícita en la respuesta.
          </p>
        </section>

        <footer className="pt-2 text-sm text-[var(--sub)]">
          También podés revisar nuestra{' '}
          <Link href="/privacy" className="text-blue-400 hover:underline font-semibold">
            Política de Privacidad
          </Link>
          .
        </footer>
      </div>
    </div>
  )
}
