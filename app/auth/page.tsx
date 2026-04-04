'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'err' | 'ok' | ''>('')
  const [loading, setLoading] = useState(false)

  const feedback = (m: string, t: 'err' | 'ok' | '') => { setMsg(m); setMsgType(t) }

  const loginEmail = async () => {
    if (!email || !password) return feedback('Completá todos los campos.', 'err')
    setLoading(true)
    const { error } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) feedback(error.message, 'err')
    else router.replace('/dashboard')
  }

  const registerEmail = async () => {
    if (!name || !email || !password) return feedback('Completá todos los campos.', 'err')
    if (password.length < 8) return feedback('La contraseña debe tener al menos 8 caracteres.', 'err')
    setLoading(true)
    const { error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: 'https://app.sqlnova.app' }
    })
    setLoading(false)
    if (error) feedback(error.message, 'err')
    else feedback('¡Cuenta creada! Revisá tu email para confirmar.', 'ok')
  }

  const loginGoogle = async () => {
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://app.sqlnova.app' }
    })
  }

  const s = {
    wrap: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, position: 'relative' as const, zIndex: 1 },
    card: { width: '100%', maxWidth: 390, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 16, padding: 26 },
    brand: { textAlign: 'center' as const, marginBottom: 28 },
    tabs: { display: 'flex', background: 'var(--bg2)', borderRadius: 10, padding: 3, marginBottom: 22, gap: 2 },
    tab: (on: boolean) => ({ flex: 1, textAlign: 'center' as const, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.88rem', fontWeight: on ? 600 : 400, color: on ? 'var(--text)' : 'var(--sub)', background: on ? 'var(--bg3)' : 'transparent', border: 'none' }),
    label: { display: 'block', fontSize: '0.81rem', fontWeight: 500, color: 'var(--sub)', marginBottom: 5 },
    input: { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 13px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', marginBottom: 13 },
    btnPrimary: { width: '100%', background: 'var(--nova2)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: '0.92rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 },
    or: { display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' },
    orLine: { flex: 1, height: 1, background: 'var(--border)' },
    btnGoogle: { width: '100%', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 10, padding: 10, cursor: 'pointer', color: 'var(--sub)', fontSize: '0.87rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 },
    fb: (t: string) => ({ fontSize: '0.81rem', padding: '9px 13px', borderRadius: 8, marginTop: 10, display: msg ? 'block' : 'none', background: t === 'err' ? 'rgba(229,83,75,0.09)' : 'rgba(62,207,142,0.09)', color: t === 'err' ? 'var(--red)' : 'var(--green)', border: `1px solid ${t === 'err' ? 'rgba(229,83,75,0.2)' : 'rgba(62,207,142,0.2)'}` }),
  }

  const GoogleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )

  return (
    <div style={s.wrap}>
      <div style={{ ...s.card, animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={s.brand}>
          <div style={{ fontSize: '1.55rem', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 5 }}>
            SQL<span style={{ color: 'var(--nova)' }}>Nova</span>
          </div>
          <div style={{ color: 'var(--sub)', fontSize: '0.87rem' }}>Aprendé SQL jugando — gratis para siempre</div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab === 'login')} onClick={() => { setTab('login'); feedback('', '') }}>Ingresar</button>
          <button style={s.tab(tab === 'register')} onClick={() => { setTab('register'); feedback('', '') }}>Registrarse</button>
        </div>

        {tab === 'login' ? (
          <>
            <label style={s.label}>Correo electrónico</label>
            <input style={s.input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && loginEmail()} />
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && loginEmail()} />
            <button style={s.btnPrimary} onClick={loginEmail} disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
          </>
        ) : (
          <>
            <label style={s.label}>Tu nombre</label>
            <input style={s.input} type="text" placeholder="Ana García" value={name} onChange={e => setName(e.target.value)} />
            <label style={s.label}>Correo electrónico</label>
            <input style={s.input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && registerEmail()} />
            <button style={s.btnPrimary} onClick={registerEmail} disabled={loading}>{loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}</button>
          </>
        )}

        <div style={s.or}>
          <div style={s.orLine} />
          <span style={{ fontSize: '0.76rem', color: 'var(--dim)' }}>o continuá con</span>
          <div style={s.orLine} />
        </div>
        <button style={s.btnGoogle} onClick={loginGoogle}><GoogleIcon /> Google</button>
        <div style={s.fb(msgType)}>{msg}</div>
      </div>
    </div>
  )
}
