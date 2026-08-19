import { Link } from 'react-router-dom'
import Cabecalho from '../components/Cabecalho.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { avaliarSobrecarga } from '../data/analise.js'

export default function Sobrecarga() {
  const { profile } = useAuth()
  const { nivel, grau, excesso, temDados, itens } = avaliarSobrecarga(profile)
  const semResposta = itens.some((i) => i.valor === '—')

  return (
    <div className="tela">
      <Cabecalho titulo="Detector de Sobrecarga" />

      <div className="card" style={{
        textAlign: 'center',
        background: !temDados ? 'var(--fundo)'
          : nivel >= 33 ? 'var(--laranja-claro)' : 'var(--verde-claro)',
      }}>
        <p style={{ fontWeight: 700, color: grau.cor }}>
          {!temDados ? 'Sem dados suficientes'
            : nivel >= 66 ? 'Atenção!'
            : nivel >= 33 ? 'Fique de olho'
            : 'Tudo sob controle'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 12 }}>
          {temDados
            ? excesso > 0
              ? `Risco de sobrecarga ${grau.txt.toLowerCase()} — ${excesso.toFixed(1)}h acima do contratado`
              : 'Sua jornada está dentro do que foi contratado'
            : 'Informe suas horas no perfil para calcularmos'}
        </p>
        <Medidor nivel={nivel} cor={grau.cor} grau={grau.txt} />
      </div>

      <p className="titulo-secao">Resumo da semana</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {itens.map((it) => (
          <div key={it.rotulo} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 14 }}>{it.rotulo}</strong>
              <p style={{ fontSize: 12, color: it.alerta ? 'var(--laranja)' : 'var(--texto-suave)' }}>{it.nota}</p>
            </div>
            <strong style={{ fontSize: 16, flexShrink: 0 }}>{it.valor}</strong>
          </div>
        ))}
      </div>

      {semResposta && (
        <Link to="/onboarding" className="btn secundario" style={{ marginTop: 16 }}>
          Completar meus dados
        </Link>
      )}

      {itens.some((i) => i.alerta) && (
        <div className="card" style={{ marginTop: 16, background: 'var(--azul-claro)' }}>
          <strong style={{ fontSize: 14 }}>💡 Recomendação</strong>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            Registre seus horários de entrada, saída e intervalo todos os dias.
            Esse registro é a sua principal prova caso precise cobrar as horas
            depois. Converse com o RH ou com o sindicato da sua categoria.
          </p>
        </div>
      )}
    </div>
  )
}

function Medidor({ nivel, cor, grau }) {
  // Semicírculo de 0 a 180 graus. `nivel` já vem limitado a 0-100.
  const angulo = (nivel / 100) * 180 - 90
  return (
    <div style={{ width: 180, margin: '0 auto', textAlign: 'center' }}>
      <svg width="180" height="90" viewBox="0 0 180 100" style={{ display: 'block' }}
        role="img" aria-label={`Nível de sobrecarga: ${grau}`}>
        <path d="M10 95 A80 80 0 0 1 170 95" fill="none" stroke="var(--borda)" strokeWidth="14" strokeLinecap="round" />
        <path d="M10 95 A80 80 0 0 1 170 95" fill="none" stroke={cor} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={`${(nivel / 100) * 251} 251`} />
        <line x1="90" y1="95" x2="90" y2="30" stroke={cor} strokeWidth="3"
          transform={`rotate(${angulo} 90 95)`} strokeLinecap="round" />
        <circle cx="90" cy="95" r="6" fill={cor} />
      </svg>
      <strong style={{ display: 'block', color: cor, fontSize: 16, marginTop: 6 }}>{grau}</strong>
    </div>
  )
}
