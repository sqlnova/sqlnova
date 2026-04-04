import LeccionClient from './LeccionClient'

export function generateStaticParams() {
  return [0,1,2,3,4,5,6,7,8,9,10].map(id => ({ id: String(id) }))
}

export default function Page({ params }: { params: { id: string } }) {
  return <LeccionClient moduloId={Number(params.id)} />
}
