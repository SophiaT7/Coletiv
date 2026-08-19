import { Link } from 'react-router-dom'
import Cabecalho from '../components/Cabecalho.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { buscarMediaSalarial } from '../data/salarios.js'
import { avaliarDireitos, avaliarSobrecarga } from '../data/analise.js'
import { IconeGrafico } from '../components/Icone.jsx'

// Gera o relatório a partir dos dados do perfil, aplicando as mesmas
// regras das outras telas. São regras determinísticas — por isso a tela
// não se apresenta mais como "análise de IA", que era o que ela sugeria
// sem ter nenhum modelo por trás.
function gerarAnalise(t) {
  const pontos = []
  const { media, cargoEncontrado, estimado } = buscarMediaSalarial(t.cargo)

  if (media && t.salario > 0 && t.salario < media && !estimado) {
    const dif = (((media - t.salario) / media) * 100).toFixed(0)
    pontos.push({
      tipo: 'alerta',
      texto: `Seu salário está ${dif}% abaixo da média do Paraná para ${cargoEncontrado} (referência de mercado).`,
    })
  }

  const { excesso, temDados } = avaliarSobrecarga(t)
  if (temDados && excesso > 0) {
    pontos.push({
      tipo: 'alerta',
      texto: `Você trabalha ${excesso.toFixed(1)}h a mais que a jornada contratada por semana.`,
    })
  }

  // Direitos marcados como irregulares pelo próprio usuário no perfil.
  for (const d of avaliarDireitos(t)) {
    if (d.status === 'alerta') pontos.push({ tipo: 'alerta', texto: `${d.nome}: ${d.detalhe}.` })
  }

  const semDados = avaliarDireitos(t).filter((d) => d.status === 'sem-dados').length
  if (semDados > 0) {
    pontos.push({
      tipo: 'dica',
      texto: `Faltam ${semDados} resposta${semDados > 1 ? 's' : ''} no seu perfil. Completar deixa este relatório mais preciso.`,
    })
  }

  pontos.push({ tipo: 'dica', texto: 'Concluir cursos de capacitação pode aumentar seu potencial salarial.' })
  return pontos
}

export default function Relatorios() {
  const { profile } = useAuth()
  const t = profile
  const analise = gerarAnalise(t)
  const primeiroNome = (t.nome || '').split(' ')[0] || 'trabalhador(a)'
  const alertas = analise.filter((p) => p.tipo === 'alerta').length

  return (
    <div className="tela">
      <Cabecalho titulo="Relatório personalizado" />

      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff' }}>
        <IconeGrafico tamanho={32} />
        <div>
          <strong>Análise automática dos seus dados</strong>
          <p style={{ fontSize: 12, opacity: 0.9 }}>
            Gerada por regras a partir do que você informou no perfil
          </p>
        </div>
      </div>

      <p className="titulo-secao">Resumo geral</p>
      <div className="card">
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          Olá, {primeiroNome}!{' '}
          {alertas === 0
            ? 'Com base no que você informou, não encontramos pontos de atenção. Veja abaixo as recomendações.'
            : `Encontramos ${alertas} ponto${alertas > 1 ? 's' : ''} de atenção na sua situação profissional. Veja abaixo.`}
        </p>
      </div>

      <p className="titulo-secao">Pontos de atenção</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {analise.map((p, i) => (
          <div key={i} className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>{p.tipo === 'alerta' ? '⚠️' : '💡'}</span>
            <p style={{ fontSize: 14 }}>{p.texto}</p>
          </div>
        ))}
      </div>

      <Link to="/capacitacao" className="btn" style={{ marginTop: 20 }}>
        Ver cursos gratuitos recomendados
      </Link>
      <Link to="/radar" className="btn secundario" style={{ marginTop: 10 }}>
        Revisar meus direitos
      </Link>
    </div>
  )
}
