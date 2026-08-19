import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

const setores = ['Comércio', 'Indústria', 'Serviços', 'Trabalho informal', 'Outro']

// Perguntas que alimentam o Radar de Direitos. Sem elas o Radar não
// inventa nada: o item aparece como "não informado".
const perguntasDireitos = [
  { campo: 'carteira_assinada', rotulo: 'Você tem registro em carteira?' },
  { campo: 'ferias_em_dia', rotulo: 'Suas férias estão em dia?' },
  { campo: 'decimo_terceiro_em_dia', rotulo: 'Você recebeu o 13º salário?' },
  { campo: 'intervalo_respeitado', rotulo: 'Seu intervalo de almoço é respeitado?' },
  { campo: 'descanso_semanal', rotulo: 'Você folga pelo menos 1 dia por semana?' },
]

// booleano <-> valor do <select>
const paraSelect = (v) => (v === true ? 'sim' : v === false ? 'nao' : '')
const paraBooleano = (v) => (v === 'sim' ? true : v === 'nao' ? false : null)

export default function Onboarding() {
  const { profile, salvarPerfil } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: profile?.nome ?? '',
    cargo: profile?.cargo ?? '',
    cidade: profile?.cidade ?? '',
    setor: profile?.setor ?? 'Serviços',
    salario: profile?.salario ?? '',
    jornada_semanal_horas: profile?.jornada_semanal_horas ?? 44,
    horas_trabalhadas_semana: profile?.horas_trabalhadas_semana ?? '',
    horas_extras_semana: profile?.horas_extras_semana ?? '',
    carteira_assinada: paraSelect(profile?.carteira_assinada),
    ferias_em_dia: paraSelect(profile?.ferias_em_dia),
    decimo_terceiro_em_dia: paraSelect(profile?.decimo_terceiro_em_dia),
    intervalo_respeitado: paraSelect(profile?.intervalo_respeitado),
    descanso_semanal: paraSelect(profile?.descanso_semanal),
  })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  // As mesmas faixas validadas por CHECK no banco — avisamos antes de
  // enviar para o erro não voltar como mensagem crua do Postgres.
  function validar(dados) {
    if (dados.salario < 0) return 'O salário não pode ser negativo.'
    const horas = [
      ['jornada contratada', dados.jornada_semanal_horas],
      ['horas trabalhadas', dados.horas_trabalhadas_semana],
      ['horas extras', dados.horas_extras_semana],
    ]
    for (const [nome, valor] of horas) {
      if (valor < 0) return `O campo "${nome}" não pode ser negativo.`
      if (valor > 168) return `O campo "${nome}" não pode passar de 168h (uma semana inteira).`
    }
    return ''
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')

    const dados = {
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      cidade: form.cidade.trim(),
      setor: form.setor,
      salario: Number(form.salario) || 0,
      jornada_semanal_horas: Number(form.jornada_semanal_horas) || 44,
      horas_trabalhadas_semana: Number(form.horas_trabalhadas_semana) || 0,
      horas_extras_semana: Number(form.horas_extras_semana) || 0,
      carteira_assinada: paraBooleano(form.carteira_assinada),
      ferias_em_dia: paraBooleano(form.ferias_em_dia),
      decimo_terceiro_em_dia: paraBooleano(form.decimo_terceiro_em_dia),
      intervalo_respeitado: paraBooleano(form.intervalo_respeitado),
      descanso_semanal: paraBooleano(form.descanso_semanal),
    }

    if (!dados.nome) return setErro('Informe seu nome.')
    const problema = validar(dados)
    if (problema) return setErro(problema)

    setCarregando(true)
    try {
      await salvarPerfil(dados)
      navigate('/')
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="tela" style={{ paddingTop: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Seu perfil profissional</h1>
      <p style={{ fontSize: 14, color: 'var(--texto-suave)', margin: '6px 0 18px' }}>
        Esses dados personalizam os relatórios e alertas do app.
      </p>

      <form onSubmit={enviar}>
      <div className="card login-form">
        <label htmlFor="nome">Nome completo</label>
        <input id="nome" value={form.nome} onChange={set('nome')} required placeholder="Seu nome" />

        <label htmlFor="cargo">Cargo / Profissão</label>
        <input id="cargo" value={form.cargo} onChange={set('cargo')} required placeholder="Ex.: Auxiliar Administrativo" />

        <label htmlFor="cidade">Cidade</label>
        <input id="cidade" value={form.cidade} onChange={set('cidade')} placeholder="Ex.: Bandeirantes, PR" />

        <label htmlFor="setor">Setor</label>
        <select id="setor" className="campo-select" value={form.setor} onChange={set('setor')}>
          {setores.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <label htmlFor="salario">Salário mensal (R$)</label>
        <input id="salario" type="number" min="0" step="0.01" value={form.salario}
          onChange={set('salario')} required placeholder="Ex.: 2350" />

        <label htmlFor="jornada">Jornada contratada (horas/semana)</label>
        <input id="jornada" type="number" min="0" max="168" value={form.jornada_semanal_horas}
          onChange={set('jornada_semanal_horas')} placeholder="44" />

        <label htmlFor="trabalhadas">Horas realmente trabalhadas por semana</label>
        <input id="trabalhadas" type="number" min="0" max="168" step="0.5" value={form.horas_trabalhadas_semana}
          onChange={set('horas_trabalhadas_semana')} placeholder="Ex.: 47.5" />

        <label htmlFor="extras">Horas extras por semana</label>
        <input id="extras" type="number" min="0" max="168" step="0.5" value={form.horas_extras_semana}
          onChange={set('horas_extras_semana')} placeholder="Ex.: 8" />
      </div>

      <p className="titulo-secao">Seus direitos hoje</p>
      <p style={{ fontSize: 13, color: 'var(--texto-suave)', margin: '0 4px 12px' }}>
        Responder é opcional. O que você não informar aparece como
        “não informado” no Radar — o app nunca supõe irregularidade.
      </p>

      <div className="card login-form">
        {perguntasDireitos.map(({ campo, rotulo }) => (
          <div key={campo} style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={campo}>{rotulo}</label>
            <select id={campo} className="campo-select" value={form[campo]} onChange={set(campo)}>
              <option value="">Prefiro não informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
        ))}
      </div>

      {erro && <p className="login-erro" style={{ marginTop: 14 }}>{erro}</p>}

      <button className="btn" disabled={carregando} style={{ marginTop: 16 }}>
        {carregando ? 'Salvando...' : 'Salvar e continuar'}
      </button>
      </form>
    </div>
  )
}
