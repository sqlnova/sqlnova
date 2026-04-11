'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'

type Entry = {
  alias: string | null
  xp: number
  usuario_id: string
  es_yo: boolean
  posicion: number
}

type Tab = 'semanal' | 'global'

export default function LeaderboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('semanal')
  const [ranking, setRanking] = useState<Entry[]>([])
  const [semana, setSemana] = useState('')
  const [miPosicion, setMiPosicion] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const getSemanaActual = () => {
    const now = new Date()
    const jan1 = new Date(now.getFullYear(), 0, 1)
    const week = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7)
    return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
  }

  const formatSemana = (s: string) => {
    const [year, w] = s.split('-W')
    return `Semana ${parseInt(w)} · ${year}`
  }

  const loadSemanal = async (uid: string) => {
    const semanaActual = getSemanaActual()
    setSemana(semanaActual)

    const { data } = await sb
      .from('xp_semanal')
      .select('usuario_id, xp, perfiles(alias, mostrar_en_leaderboard)')
      .eq('semana', semanaActual)
      .order('xp', { ascending: false })
      .limit(50)

    if (data) {
      let pos = 1
      const entries: Entry[] = []
      for (const row of data) {
        const p = row.perfiles as any
        if (!p?.mostrar_en_leaderboard) continue
        const esYo = row.usuario_id === uid
        const entry: Entry = {
          usuario_id: row.usuario_id,
          xp: row.xp,
          alias: p?.alias || null,
          es_yo: esYo,
          posicion: pos++,
        }
        entries.push(entry)
        if (esYo) setMiPosicion(entry)
      }
      setRanking(entries)

      if (!entries.find(e => e.es_yo)) {
        const { data: miData } = await sb
          .from('xp_semanal')
          .select('xp')
          .eq('semana', semanaActual)
          .eq('usuario_id', uid)
          .single()
        if (miData) {
          const { count } = await sb
            .from('xp_semanal')
            .select('*', { count: 'exact', head: true })
            .eq('semana', semanaActual)
            .gt('xp', miData.xp)
          setMiPosicion({
            usuario_id: uid,
            xp: miData.xp,
            alias: null,
            es_yo: true,
            posicion: (count ?? 0) + 1,
          })
        }
      }
    }
  }

  const loadGlobal = async (uid: string) => {
    const { data } = await sb
      .from('perfiles')
      .select('id, alias, xp_total, mostrar_en_leaderboard')
      .eq('mostrar_en_leaderboard', true)
      .order('xp_total', { ascending: false })
      .limit(50)

    if (data) {
      let pos = 1
      const entries: Entry[] = []
      for (const row of data) {
        const esYo = row.id === uid
        const entry: Entry = {
          usuario_id: row.id,
          xp: row.xp_total ?? 0,
          alias: row.alias || null,
          es_yo: esYo,
          posicion: pos++,
        }
        entries.push(entry)
        if (esYo) setMiPosicion(entry)
      }
      setRanking(entries)

      if (!entries.find(e => e.es_yo)) {
        const { data: miData } = await sb
          .from('perfiles')
          .select('xp_total')
          .eq('id', uid)
          .single()
        if (miData) {
          const { count } = await sb
            .from('perfiles')
            .select('*', { count: 'exact', head: true })
            .eq('mostrar_en_leaderboard', true)
            .gt('xp_total', miData.xp_total ?? 0)
          setMiPosicion({
            usuario_id: uid,
            xp: miData.xp_total ?? 0,
            alias: null,
            es_yo: true,
            posicion: (count ?? 0) + 1,
          })
        }
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      setUserId(session.user.id)
      setLoading(true)
      await loadSemanal(session.user.id)
      setLoading(false)
    }
    init()
  }, [router])

  const switchTab = async (newTab: Tab) => {
    if (newTab === tab) return
    setTab(newTab)
    setRanking([])
    setMiPosicion(null)
    setLoading(true)
    if (userId) {
      if (newTab === 'semanal') await loadSemanal(userId)
      else await loadGlobal(userId)
    }
    setLoading(false)
  }

  const medalla = (pos: number) => {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return `#${pos}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* TopBar */}
      <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.replace('/dashboard')} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', color: 'var(--sub)', fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🏆 Ranking</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Leaderboard</div>
        </div>
        {tab === 'semanal' && (
          <div style={{ fontSize: '0.72rem', color: 'var(--sub)', fontFamily: 'DM Mono', textAlign: 'right' }}>{formatSemana(semana)}</div>
        )}
      </div>

      <div style={{ flex: 1, padding: 'clamp(16px,4vw,24px) clamp(14px,4vw,20px)', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
          {(['semanal', 'global'] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all 0.18s',
                background: tab === t ? 'var(--nova2)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--sub)',
              }}
            >
              {t === 'semanal' ? '📅 Semanal' : '🌍 Global'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, border: '2px solid var(--border2)', borderTopColor: 'var(--nova)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Mi posición sticky si no estoy en top visible */}
            {miPosicion && miPosicion.posicion > 10 && (
              <div style={{ background: 'rgba(77,166,255,0.08)', border: '1px solid rgba(77,166,255,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'DM Mono', fontWeight: 700, color: 'var(--nova)', fontSize: '0.9rem', minWidth: 36 }}>#{miPosicion.posicion}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Tu posición {tab === 'semanal' ? 'esta semana' : 'global'}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--sub)' }}>{miPosicion.alias || 'Sin alias'}</div>
                </div>
                <div style={{ fontFamily: 'DM Mono', fontWeight: 700, color: 'var(--amber)', fontSize: '1rem' }}>⭐ {miPosicion.xp}</div>
              </div>
            )}

            {/* Top 3 destacado */}
            {ranking.length >= 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 10, marginBottom: 20, alignItems: 'flex-end' }}>
                {[ranking[1], ranking[0], ranking[2]].map((e, i) => {
                  const heights = [110, 130, 100]
                  const colors = ['#94a3b8', '#fbbf24', '#cd7c2f']
                  return (
                    <div key={e.usuario_id} style={{ background: e.es_yo ? 'rgba(77,166,255,0.1)' : 'var(--card)', border: `2px solid ${e.es_yo ? 'var(--nova)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 10px', textAlign: 'center', height: heights[i], display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                      <div style={{ fontSize: i === 1 ? '2rem' : '1.5rem' }}>{['🥈','🥇','🥉'][i]}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: colors[i], fontFamily: 'DM Mono' }}>#{e.posicion}</div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.alias || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--amber)', fontFamily: 'DM Mono', fontWeight: 700 }}>⭐ {e.xp}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Lista completa */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {ranking.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--sub)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏁</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>
                    {tab === 'semanal' ? 'Aún no hay participantes esta semana' : 'No hay participantes en el ranking global'}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>¡Completá lecciones para aparecer en el ranking!</div>
                </div>
              ) : (
                ranking.map((e, i) => (
                  <div key={e.usuario_id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < ranking.length - 1 ? '1px solid var(--border)' : 'none',
                    background: e.es_yo ? 'rgba(77,166,255,0.05)' : 'transparent',
                  }}>
                    <div style={{ fontFamily: 'DM Mono', fontSize: '0.84rem', fontWeight: 700, minWidth: 36, color: e.posicion <= 3 ? 'var(--amber)' : 'var(--sub)', textAlign: 'center' }}>
                      {medalla(e.posicion)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: e.es_yo ? 700 : 500, color: e.es_yo ? 'var(--nova)' : 'var(--text)' }}>
                        {e.alias || '(sin alias)'}
                        {e.es_yo && <span style={{ fontSize: '0.68rem', background: 'rgba(77,166,255,0.15)', color: 'var(--nova)', borderRadius: 4, padding: '1px 5px', marginLeft: 6 }}>Vos</span>}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'DM Mono', fontWeight: 700, fontSize: '0.9rem', color: 'var(--amber)' }}>⭐ {e.xp}</div>
                  </div>
                ))
              )}
            </div>

            {/* Notas */}
            {!miPosicion && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(77,166,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--sub)', textAlign: 'center' }}>
                {tab === 'semanal'
                  ? 'Completá lecciones esta semana para aparecer en el ranking.'
                  : 'Completá lecciones para aparecer en el ranking global.'
                }{' '}
                Podés configurar tu alias en <span style={{ color: 'var(--nova)', cursor: 'pointer' }} onClick={() => router.push('/perfil')}>Mi perfil</span>.
              </div>
            )}

            {!miPosicion?.alias && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.2)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--amber)', textAlign: 'center' }}>
                💡 Configurá un alias en <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => router.push('/perfil')}>Mi perfil</span> para aparecer con tu nombre en el ranking.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
