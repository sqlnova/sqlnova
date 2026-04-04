'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
      else router.replace('/auth')
    })
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16 }}>
          SQL<span style={{ color: 'var(--nova)' }}>Nova</span>
        </div>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.7s linear infinite' }} />
      </div>
    </div>
  )
}
