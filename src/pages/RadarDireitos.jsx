import { Link } from 'react-router-dom'
import Cabecalho from '../components/Cabecalho.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { avaliarDireitos, resumirDireitos } from '../data/analise.js'
import { IconeEscudo } from '../components/Icone.jsx'

const rotuloStatus = {
  ok: '✓ Em dia',
  alerta: '⚠ Atenção',
  'sem-dados': 'Não informado',
}

export default function RadarDireitos() {
  const { profile } = useAuth()
  const direitos = avaliarDireitos(profile)
  const { alertas, semDados } = resumirDireitos(direitos)

  const titulo = alertas > 0
    ? `${alertas} ponto${alertas > 1 ? 's' : ''} de atenção`
    : semDados > 0 ? 'Faltam informações' : 'Tudo certo!'

  const subtitulo = alertas > 0
    ? 'Veja abaixo o que merece atenção'
    : semDados > 0
      ? `${semDados} item${semDados > 1 ? 's' : ''} sem resposta no seu perfil`
      : 'Com base no que você informou, está tudo em dia'

  const fundo = alertas > 0 ? 'var(--laranja-claro)' : semDados > 0 ? 'var(--fundo)' : 'var(--verde-claro)'

  return (
    <div className="tela">
      <Cabecalho titulo="Radar de Direitos" />

      <div className="card" style={{ background: fundo, display: 'flex', gap: 12, alignItems: 'center' }}>
        <IconeEscudo tamanho={34} />
        <div>
          <strong style={{ display: 'block' }}>{titulo}</strong>
          <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>{subtitulo}</span>
        </div>
      </div>

      <p className="titulo-secao">Seus direitos</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {direitos.map((d) => (
          <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 14 }}>{d.nome}</strong>
              <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>{d.detalhe}</p>
            </div>
            <span className={`badge ${d.status}`} style={{ flexShrink: 0 }}>
              {rotuloStatus[d.status]}
            </span>
          </div>
        ))}
      </div>

      {semDados > 0 && (
        <Link to="/onboarding" className="btn secundario" style={{ marginTop: 16 }}>
          Completar meus dados
        </Link>
      )}

      <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 16, lineHeight: 1.5 }}>
        Esta análise usa apenas o que você informou no perfil e as regras
        gerais da CLT. Não substitui orientação jurídica — em caso de dúvida,
        procure o sindicato da sua categoria ou a Defensoria Pública.
      </p>
    </div>
  )
}
