'use client'
import { useEffect } from 'react'
import { sb } from '@/lib/supabase'

export default function ThemeHandler() {
  useEffect(() => {
    const syncTema = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (session) {
        const { data } = await sb.from('perfiles').select('tema').eq('id', session.user.id).single()
        if (data?.tema) {
          document.documentElement.setAttribute('data-theme', data.tema)
          localStorage.setItem('sqlnova-tema', data.tema)
        }
      }
    }
    syncTema()
  }, [])

  return null // No dibuja nada, solo ejecuta la lógica
}
