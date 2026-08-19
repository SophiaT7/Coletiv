import { useEffect, useState } from 'react'
import Cabecalho from '../components/Cabecalho.jsx'
import { enquetes } from '../data/trabalhador.js'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function Assembleia() {
  const { usuario } = useAuth()
  const [votos, setVotos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [aoVivo, setAoVivo] = useState(false)
  const [erro, setErro] = useState('')

  // Busca inicial + assinatura em tempo real.
  //
  // A tabela "votos" está na publicação do realtime (veja o schema.sql), então
  // qualquer voto de qualquer participante chega aqui como evento e a gente
  // recarrega a contagem. É o que faz a assembleia parecer uma assembleia:
  // o resultado se move enquanto as pessoas votam.
  //
  // Recarregar tudo a cada evento é proposital — a consulta é pequena e essa
  // abordagem nunca fica fora de sincronia, diferente de somar/subtrair no
  // cliente a partir do payload de cada evento.
  useEffect(() => {
    let ativo = true

    const buscar = () => supabase
      .from('votos')
      .select('enquete_id, opcao, usuario_id')
      .then(({ data, error }) => {
        if (!ativo) return
        if (error) {
          console.error('[Coletiv] Falha ao carregar os votos:', error)
          setErro('Não foi possível carregar os votos. Verifique sua conexão.')
        } else {
          setVotos(data ?? [])
        }
        setCarregando(false)
      })

    buscar()

    const canal = supabase
      .channel('assembleia-votos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votos' }, buscar)
      .subscribe((status) => {
        if (ativo) setAoVivo(status === 'SUBSCRIBED')
      })

    return () => {
      ativo = false
      supabase.removeChannel(canal)
    }
  }, [])

  // Registra (ou troca) o voto. A chave primária (usuario_id, enquete_id)
  // garante 1 voto por pessoa em cada enquete, mesmo com cliques repetidos.
  async function votar(enqueteId, opcao) {
    if (!usuario) return
    const anterior = votos
    // Atualização otimista, para a tela responder na hora. O evento de
    // realtime chega logo depois e confirma (ou corrige) esse estado.
    setVotos([
      ...votos.filter((v) => !(v.usuario_id === usuario.id && v.enquete_id === enqueteId)),
      { usuario_id: usuario.id, enquete_id: enqueteId, opcao },
    ])

    const { error } = await supabase
      .from('votos')
      .upsert({ usuario_id: usuario.id, enquete_id: enqueteId, opcao })

    if (error) {
      console.error('[Coletiv] Falha ao registrar o voto:', error)
      setVotos(anterior) // desfaz
      setErro('Não foi possível registrar seu voto. Tente de novo.')
    } else {
      setErro('')
    }
  }

  return (
    <div className="tela">
      <Cabecalho titulo="Assembleia Digital" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: aoVivo ? 'var(--verde)' : 'var(--texto-suave)',
        }} />
        <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
          {aoVivo ? 'Resultados ao vivo' : 'Conectando...'}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 12 }}>
        Participe das enquetes e faça sua voz ser ouvida. Você pode mudar seu
        voto quando quiser.
      </p>

      {erro && <p className="msg-erro" style={{ marginBottom: 12 }}>{erro}</p>}

      {carregando ? (
        <p style={{ fontSize: 13, color: 'var(--texto-suave)' }}>Carregando enquetes...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {enquetes.map((e) => (
            <Enquete
              key={e.id}
              enquete={e}
              votos={votos.filter((v) => v.enquete_id === e.id)}
              meuVoto={votos.find((v) => v.enquete_id === e.id && v.usuario_id === usuario?.id)?.opcao}
              aoVotar={(opcao) => votar(e.id, opcao)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Enquete({ enquete, votos, meuVoto, aoVotar }) {
  const total = votos.length
  const jaVotou = meuVoto !== undefined

  return (
    <div className="card">
      <strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>{enquete.pergunta}</strong>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {enquete.opcoes.map((texto, i) => {
          const contagem = votos.filter((v) => v.opcao === i).length
          const pct = total ? Math.round((contagem / total) * 100) : 0
          const escolhida = meuVoto === i
          return (
            <button key={i} onClick={() => aoVotar(i)} aria-pressed={escolhida}
              style={{
                position: 'relative', textAlign: 'left', padding: '10px 12px',
                borderRadius: 10, border: `1.5px solid ${escolhida ? 'var(--azul)' : 'var(--borda)'}`,
                overflow: 'hidden', cursor: 'pointer',
              }}>
              {jaVotou && (
                <div style={{
                  position: 'absolute', inset: 0, width: `${pct}%`,
                  background: escolhida ? 'var(--azul-claro)' : 'var(--fundo)', zIndex: 0,
                  transition: 'width 0.4s ease',
                }} />
              )}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{texto}</span>
                {jaVotou && <strong>{pct}%</strong>}
              </div>
            </button>
          )
        })}
      </div>
      <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 10 }}>
        {total === 0 ? 'Seja o primeiro a votar'
          : `${total} voto${total > 1 ? 's' : ''}`}
        {jaVotou && ' · obrigado por participar!'}
      </p>
    </div>
  )
}
