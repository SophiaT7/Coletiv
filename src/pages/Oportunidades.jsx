import { useEffect, useState } from 'react'
import Cabecalho from '../components/Cabecalho.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { ordenarPorCompatibilidade } from '../data/trabalhador.js'

// Formata a faixa salarial vinda do banco (salario_min / salario_max).
function faixaSalarial(min, max) {
  const f = (n) => Number(n).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  })
  if (min && max) return `${f(min)} – ${f(max)}`
  if (min) return `A partir de ${f(min)}`
  if (max) return `Até ${f(max)}`
  return null
}

export default function Oportunidades() {
  const { profile } = useAuth()
  const [vagas, setVagas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    supabase
      .from('vagas')
      .select('id, titulo, empresa, local, setor, salario_min, salario_max, url')
      .order('importada_em', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!ativo) return
        if (error) {
          console.error('[Coletiv] Falha ao carregar as vagas:', error)
          setErro('Não foi possível carregar as vagas. Verifique sua conexão.')
        } else {
          setVagas(data ?? [])
        }
        setCarregando(false)
      })
    return () => { ativo = false }
  }, [])

  const lista = ordenarPorCompatibilidade(vagas, profile)

  return (
    <div className="tela">
      <Cabecalho titulo="Mapa de Oportunidades" />

      <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 12 }}>
        Vagas ordenadas pela compatibilidade com o seu perfil
        {profile.setor ? ` (setor: ${profile.setor})` : ''}.
      </p>

      {erro && <p className="msg-erro" style={{ marginBottom: 12 }}>{erro}</p>}

      {carregando ? (
        <p style={{ fontSize: 13, color: 'var(--texto-suave)' }}>Carregando vagas...</p>
      ) : lista.length === 0 && !erro ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Nenhuma vaga por enquanto</p>
          <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginTop: 6 }}>
            Ainda não encontramos vagas para a sua região. Estamos buscando
            todos os dias — volte em breve.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lista.map((v) => {
            const salario = faixaSalarial(v.salario_min, v.salario_max)
            return (
              <div key={v.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 15 }}>{v.titulo}</strong>
                    <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                      {[v.empresa, v.local].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className={`badge ${v.compat >= 80 ? 'ok' : 'alerta'}`} style={{ flexShrink: 0 }}>
                    {v.compat}% match
                  </span>
                </div>

                {salario && (
                  <p style={{ fontSize: 14, marginTop: 10, fontWeight: 600, color: 'var(--azul)' }}>
                    {salario}
                  </p>
                )}

                {v.url && (
                  <a className="btn" href={v.url} target="_blank" rel="noopener noreferrer"
                    style={{ marginTop: 12 }}>
                    Ver vaga ↗
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {lista.length > 0 && (
        <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 16, lineHeight: 1.5 }}>
          Vagas fornecidas pela Adzuna. O Coletiv apenas exibe os anúncios; a
          candidatura acontece no site de origem de cada vaga.
        </p>
      )}
    </div>
  )
}
