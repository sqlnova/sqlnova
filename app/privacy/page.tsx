import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-blue-500 hover:underline text-sm font-bold">← Volver al inicio</Link>
        
        <h1 className="text-3xl font-extrabold mb-8">Política de Privacidad</h1>
        
        <p className="text-[var(--sub)]">Última actualización: Abril de 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Información que recopilamos</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            Al registrarte en SQLNova mediante Google, recopilamos únicamente la información básica de tu perfil público (nombre, dirección de correo electrónico y foto de perfil). También almacenamos datos sobre tu progreso en la plataforma, las lecciones completadas y los puntos de experiencia (XP) obtenidos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2. Uso de la información</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            Utilizamos tu información para: crear y mantener tu cuenta, mostrar tu nombre y puntaje en el Leaderboard (ranking) de la plataforma, y guardar tu progreso en las lecciones y retos diarios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3. Protección de datos y terceros</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            No vendemos, alquilamos ni compartimos tus datos personales con terceros para fines comerciales. La autenticación y base de datos son gestionadas de forma segura a través de Supabase. En la sección "Pocket Database", los archivos CSV que subís se procesan localmente en tu navegador y no se almacenan en nuestros servidores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4. Eliminación de datos</h2>
          <p className="text-[var(--sub)] leading-relaxed">
            Tenés derecho a solicitar la eliminación completa de tu cuenta y todos los datos asociados en cualquier momento contactando a nuestro equipo de soporte.
          </p>
        </section>
      </div>
    </div>
  )
}
