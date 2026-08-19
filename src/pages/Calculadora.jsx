import { useState } from 'react'
import Cabecalho from '../components/Cabecalho.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { buscarMediaSalarial } from '../data/salarios.js'

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Calculadora() {
  const { profile, salvarPerfil } = useAuth()
  const [salario, setSalario] = useState(Number(profile.salario) || 0)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const resultado = buscarMediaSalarial(profile.cargo)
  const { media, cargoEncontrado, amostra, estimado, fonte } = resultado
  const diferenca = salario - media
  const percentual = media ? ((diferenca / media) * 100).toFixed(1) : '0'
  const abaixo = diferenca < 0
  const escala = Math.max(media, salario) * 1.15 || 1

  // O valor digitado aqui só vira "o seu salário" quando o usuário salva.
  const alterado = salario !== (Number(profile.salario) || 0)

  async function salvar() {
    setErro(''); setSalvando(true)
    try {
      await salvarPerfil({ salario })
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="tela">
      <Cabecalho titulo="Calculadora de Valorização" />

      <div className="card">
        <label htmlFor="salario-atual" style={{ fontSize: 13, color: 'var(--texto-suave)', fontWeight: 600 }}>
          Seu salário atual
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>R$</span>
          <input
            id="salario-atual"
            type="number"
            min="0"
            step="0.01"
            value={salario}
            onChange={(e) => setSalario(Math.max(0, Number(e.target.value)))}
            style={{
              fontSize: 24, fontWeight: 700, border: 'none', outline: 'none',
              width: '100%', color: 'var(--azul)',
            }}
          />
        </div>

        {alterado && (
          <button className="btn secundario" onClick={salvar} disabled={salvando} style={{ marginTop: 12 }}>
            {salvando ? 'Salvando...' : 'Salvar no meu perfil'}
          </button>
        )}
        {erro && <p className="msg-erro" style={{ marginTop: 10 }}>{erro}</p>}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 6 }}>
          Média no Paraná para{' '}
          <strong>{cargoEncontrado || profile.cargo}</strong>
        </p>
        <strong style={{ fontSize: 22 }}>{fmt(media)}</strong>

        {estimado && (
          <p style={{ fontSize: 12, color: 'var(--laranja)', marginTop: 6 }}>
            ⚠️ Não temos dados específicos para “{profile.cargo}”. Mostramos uma
            referência geral dos cargos no Paraná.
          </p>
        )}

        {/* Barra comparativa */}
        <div style={{ marginTop: 16 }}>
          {/* A escala acompanha o maior dos dois, senão a barra de quem
              ganha bem acima da média fica travada em 100%. */}
          <Barra rotulo="Média no Paraná" valor={media} max={escala} />
          <Barra rotulo="Seu salário" valor={salario} max={escala} destaque />
        </div>
      </div>

      <div className="card" style={{
        marginTop: 12,
        background: abaixo ? '#fee2e2' : 'var(--verde-claro)',
      }}>
        <strong style={{ fontSize: 15 }}>
          {abaixo ? '📉 Abaixo da média' : '📈 Acima da média'}
        </strong>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          Seu salário está <strong>{Math.abs(percentual)}%</strong>{' '}
          {abaixo ? 'abaixo' : 'acima'} da média ({fmt(Math.abs(diferenca))}).
        </p>
        {abaixo && (
          <p style={{ fontSize: 13, marginTop: 8, color: 'var(--texto-suave)' }}>
            💡 Invista em qualificação para ampliar suas chances de valorização.
          </p>
        )}
      </div>

      {/* Transparência: de onde vêm os números */}
      <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 14, lineHeight: 1.5 }}>
        Fonte: {fonte.nome} — médias do {fonte.abrangencia}, {fonte.atualizado}
        {amostra ? ` (${amostra.toLocaleString('pt-BR')} salários informados)` : ''}.
        {' '}Valor de referência de mercado, não oficial. {fonte.observacao}
      </p>
    </div>
  )
}

function Barra({ rotulo, valor, max, destaque }) {
  const largura = Math.min((valor / max) * 100, 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>{rotulo}</span>
        <span style={{ fontWeight: 600 }}>{fmt(valor)}</span>
      </div>
      <div style={{ height: 10, background: 'var(--borda)', borderRadius: 999 }}>
        <div style={{
          width: `${largura}%`, height: '100%', borderRadius: 999,
          background: destaque ? 'var(--azul)' : 'var(--texto-suave)',
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  )
}
