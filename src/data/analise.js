// =====================================================================
// Regras de análise do Coletiv.
// ---------------------------------------------------------------------
// REGRA DE OURO deste arquivo: nada de alerta inventado. Quando o perfil
// não tem a informação, o status é 'sem-dados' — nunca 'alerta'. Um app
// sobre direitos não pode afirmar irregularidade sem base.
//
// Referências legais usadas:
//  - Jornada máxima: 44h/semana (CF art. 7º, XIII)
//  - Horas extras: até 2h/dia, ~10h/semana (CLT art. 59)
//  - Intervalo intrajornada: mín. 1h em jornadas acima de 6h (CLT art. 71)
//  - Descanso semanal remunerado: 24h consecutivas (CLT art. 67)
// =====================================================================

export const JORNADA_LEGAL_SEMANAL = 44
export const EXTRAS_LIMITE_SEMANAL = 10

const num = (v) => Number(v) || 0

// Converte um campo booleano do perfil em status de direito.
// null/undefined => 'sem-dados' (o usuário ainda não respondeu).
function porResposta(valor, textoOk, textoAlerta) {
  if (valor === true) return { status: 'ok', detalhe: textoOk }
  if (valor === false) return { status: 'alerta', detalhe: textoAlerta }
  return { status: 'sem-dados', detalhe: 'Você ainda não informou' }
}

// ---------------------------------------------------------------------
// Radar de Direitos
// ---------------------------------------------------------------------
export function avaliarDireitos(perfil = {}) {
  const jornada = num(perfil.jornada_semanal_horas) || JORNADA_LEGAL_SEMANAL
  const trabalhadas = num(perfil.horas_trabalhadas_semana)
  const extras = num(perfil.horas_extras_semana)

  const lista = [
    {
      id: 'carteira',
      nome: 'Registro em carteira',
      ...porResposta(
        perfil.carteira_assinada,
        'Vínculo registrado',
        'Trabalhar sem registro é irregular — procure orientação',
      ),
    },
    {
      id: 'ferias',
      nome: 'Férias remuneradas',
      ...porResposta(
        perfil.ferias_em_dia,
        'Em dia',
        'Férias atrasadas: são devidas a cada 12 meses trabalhados',
      ),
    },
    {
      id: 'decimo',
      nome: '13º salário',
      ...porResposta(
        perfil.decimo_terceiro_em_dia,
        'Em dia',
        'O 13º é obrigatório e deve ser pago até 20/12',
      ),
    },
    {
      id: 'intervalo',
      nome: 'Intervalo intrajornada',
      ...porResposta(
        perfil.intervalo_respeitado,
        'Intervalo respeitado',
        'Jornadas acima de 6h exigem no mínimo 1h de intervalo',
      ),
    },
    {
      id: 'descanso',
      nome: 'Descanso semanal',
      ...porResposta(
        perfil.descanso_semanal,
        'Pelo menos 1 dia de folga por semana',
        'A lei garante 24h consecutivas de descanso por semana',
      ),
    },
  ]

  // Horas extras — calculado, não perguntado.
  if (!perfil.horas_extras_semana && perfil.horas_extras_semana !== 0) {
    lista.push({ id: 'extras', nome: 'Horas extras', status: 'sem-dados', detalhe: 'Você ainda não informou' })
  } else if (extras > EXTRAS_LIMITE_SEMANAL) {
    lista.push({
      id: 'extras',
      nome: 'Horas extras',
      status: 'alerta',
      detalhe: `${extras}h/semana ultrapassa o limite legal de ${EXTRAS_LIMITE_SEMANAL}h`,
    })
  } else {
    lista.push({
      id: 'extras',
      nome: 'Horas extras',
      status: 'ok',
      detalhe: extras === 0 ? 'Nenhuma hora extra informada' : `${extras}h/semana, dentro do limite legal`,
    })
  }

  // Jornada semanal — calculado.
  if (trabalhadas === 0) {
    lista.push({ id: 'jornada', nome: 'Jornada semanal', status: 'sem-dados', detalhe: 'Você ainda não informou' })
  } else if (trabalhadas > JORNADA_LEGAL_SEMANAL) {
    lista.push({
      id: 'jornada',
      nome: 'Jornada semanal',
      status: 'alerta',
      detalhe: `${trabalhadas}h ultrapassa as ${JORNADA_LEGAL_SEMANAL}h previstas na Constituição`,
    })
  } else if (trabalhadas > jornada) {
    lista.push({
      id: 'jornada',
      nome: 'Jornada semanal',
      status: 'alerta',
      detalhe: `${trabalhadas}h por semana, acima das ${jornada}h contratadas`,
    })
  } else {
    lista.push({
      id: 'jornada',
      nome: 'Jornada semanal',
      status: 'ok',
      detalhe: `${trabalhadas}h por semana, dentro do contratado`,
    })
  }

  return lista
}

export function resumirDireitos(lista) {
  return {
    alertas: lista.filter((d) => d.status === 'alerta').length,
    semDados: lista.filter((d) => d.status === 'sem-dados').length,
    ok: lista.filter((d) => d.status === 'ok').length,
  }
}

// ---------------------------------------------------------------------
// Detector de Sobrecarga
// ---------------------------------------------------------------------
export function avaliarSobrecarga(perfil = {}) {
  const jornada = num(perfil.jornada_semanal_horas) || JORNADA_LEGAL_SEMANAL
  const trabalhadas = num(perfil.horas_trabalhadas_semana)
  const extras = num(perfil.horas_extras_semana)
  const temDados = trabalhadas > 0

  // Excesso sobre a jornada contratada, em % de uma escala de 12h extras.
  const excesso = Math.max(trabalhadas - jornada, 0)
  const nivel = Math.max(0, Math.min(Math.round((excesso / 12) * 100), 100))

  const grau = !temDados
    ? { txt: 'Sem dados', cor: 'var(--texto-suave)' }
    : nivel < 33
      ? { txt: 'Baixo', cor: 'var(--verde)' }
      : nivel < 66
        ? { txt: 'Moderado', cor: 'var(--laranja)' }
        : { txt: 'Alto', cor: 'var(--vermelho)' }

  const itens = [
    temDados
      ? {
          rotulo: 'Horas trabalhadas',
          valor: `${trabalhadas}h`,
          nota: excesso > 0 ? `${excesso.toFixed(1)}h acima das ${jornada}h contratadas` : `Dentro das ${jornada}h contratadas`,
          alerta: excesso > 0,
        }
      : { rotulo: 'Horas trabalhadas', valor: '—', nota: 'Informe no seu perfil', alerta: false },
    {
      rotulo: 'Horas extras',
      valor: `${extras}h`,
      nota: extras > EXTRAS_LIMITE_SEMANAL
        ? `Acima do limite legal de ${EXTRAS_LIMITE_SEMANAL}h/semana`
        : extras > 0 ? 'Dentro do limite legal' : 'Nenhuma informada',
      alerta: extras > EXTRAS_LIMITE_SEMANAL,
    },
    itemBooleano('Intervalos', perfil.intervalo_respeitado, 'Respeitados', 'Abaixo do mínimo legal'),
    itemBooleano('Descanso semanal', perfil.descanso_semanal, 'Ao menos 1 dia/semana', 'Abaixo do mínimo legal'),
  ]

  return { nivel, grau, excesso, temDados, itens }
}

function itemBooleano(rotulo, valor, textoOk, textoAlerta) {
  if (valor === true) return { rotulo, valor: 'Ok', nota: textoOk, alerta: false }
  if (valor === false) return { rotulo, valor: 'Irregular', nota: textoAlerta, alerta: true }
  return { rotulo, valor: '—', nota: 'Informe no seu perfil', alerta: false }
}
