import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { avaliarDireitos, resumirDireitos, avaliarSobrecarga } from '../data/analise.js'
import {
  IconeEscudo, IconeGrafico, IconeMedidor, IconeLivro, IconeMapa,
  IconePessoas, IconePerfil, IconeSeta,
} from '../components/Icone.jsx'
import './Dashboard.css'

const acessoRapido = [
  { to: '/radar', rotulo: 'Radar de Direitos', Icone: IconeEscudo, cor: 'var(--verde)' },
  { to: '/calculadora', rotulo: 'Valorização', Icone: IconeGrafico, cor: 'var(--azul)' },
  { to: '/sobrecarga', rotulo: 'Sobrecarga', Icone: IconeMedidor, cor: 'var(--laranja)' },
  { to: '/capacitacao', rotulo: 'Capacitação', Icone: IconeLivro, cor: '#9333ea' },
  { to: '/oportunidades', rotulo: 'Oportunidades', Icone: IconeMapa, cor: '#0891b2' },
  { to: '/relatorios', rotulo: 'Relatórios', Icone: IconeGrafico, cor: '#db2777' },
  { to: '/assembleia', rotulo: 'Assembleia', Icone: IconePessoas, cor: '#ca8a04' },
  { to: '/perfil', rotulo: 'Perfil', Icone: IconePerfil, cor: 'var(--texto-suave)' },
]

const fmt = (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const { profile } = useAuth()
  const t = profile
  const primeiroNome = (t.nome || '').split(' ')[0]
  const inicial = (t.nome || '?').trim().charAt(0).toUpperCase() || '?'

  const { excesso, temDados } = avaliarSobrecarga(t)
  const { alertas, semDados } = resumirDireitos(avaliarDireitos(t))

  // Chamada do card final: descreve o que as regras realmente encontraram,
  // em vez de anunciar uma detecção que pode não existir.
  const chamada = alertas > 0
    ? `Encontramos ${alertas} ponto${alertas > 1 ? 's' : ''} de atenção nos seus dados. Veja a análise.`
    : semDados > 0
      ? 'Complete seu perfil para receber uma análise mais precisa.'
      : 'Nenhum ponto de atenção nos seus dados. Veja o relatório completo.'

  return (
    <div className="tela">
      {/* Topo */}
      <div className="dash-topo">
        <div>
          <p className="dash-saudacao">Olá{primeiroNome ? `, ${primeiroNome}` : ''} 👋</p>
          <p className="dash-sub">Conheça seus direitos e oportunidades</p>
        </div>
        <Link to="/perfil" className="dash-avatar" aria-label="Abrir meu perfil">{inicial}</Link>
      </div>

      {/* Card destaque */}
      <div className="dash-destaque">
        <p className="dash-destaque-label">Sua saúde e seus direitos são nossa prioridade</p>
        <div className="dash-destaque-grid">
          <div>
            <span className="mini-label">Jornada da semana</span>
            <strong>{temDados ? `${t.horas_trabalhadas_semana}h` : '—'}</strong>
          </div>
          <div>
            <span className="mini-label">Salário atual</span>
            <strong>{fmt(t.salario)}</strong>
          </div>
        </div>
        {temDados && excesso > 0 && (
          <span className="badge alerta">Acima da jornada contratada</span>
        )}
      </div>

      {/* Acesso rápido */}
      <p className="titulo-secao">Acesso rápido</p>
      <div className="dash-grid">
        {acessoRapido.map(({ to, rotulo, Icone, cor }) => (
          <Link key={to} to={to} className="dash-atalho">
            <span className="dash-atalho-icone" style={{ background: cor }}>
              <Icone tamanho={22} />
            </span>
            <span>{rotulo}</span>
          </Link>
        ))}
      </div>

      {/* Resumo do relatório */}
      <Link to="/relatorios" className="dash-dica">
        <IconeGrafico tamanho={26} />
        <div>
          <strong>Relatório personalizado</strong>
          <p>{chamada}</p>
        </div>
        <IconeSeta tamanho={20} />
      </Link>
    </div>
  )
}
