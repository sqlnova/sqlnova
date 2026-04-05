import LeccionClient from './LeccionClient'

export function generateStaticParams() {
  return Array.from({ length: 11 }, (_, i) => ({ id: String(i) }))
}

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const moduloId = parseInt(id)
  return <LeccionClient moduloId={moduloId} />
}
