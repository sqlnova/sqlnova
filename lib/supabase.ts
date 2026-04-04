import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxeefmkljmsbqaomeisi.supabase.co'
const supabaseKey = 'sb_publishable_CLN6aQlEnQETHUKZ3VmQbA_XPfsptMg'

export const sb = createClient(supabaseUrl, supabaseKey)

export type Perfil = {
  id: string
  nombre: string
  email: string
  xp_total: number
  nivel: number
  racha_actual: number
  es_premium: boolean
}

export type Progreso = {
  leccion_id: string
  modulo_id: number
  completada: boolean
  xp_ganado: number
  pista_usada: boolean
}
