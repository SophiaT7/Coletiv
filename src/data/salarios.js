// =====================================================================
// Salários médios por cargo — Estado do Paraná (PR)
// ---------------------------------------------------------------------
// Fonte: Indeed Brasil (br.indeed.com) — "Salário-base médio para
//   <cargo> no Paraná", médias reportadas por trabalhadores no estado.
// Coletado em: junho/2026.
// Abrangência: ESTADO do Paraná. Cidades pequenas como Bandeirantes
//   (Norte Pioneiro) não têm amostra própria suficiente, então usamos
//   a média estadual como referência regional.
// IMPORTANTE: é uma REFERÊNCIA de mercado, não um valor oficial/exato.
// =====================================================================

export const FONTE_SALARIOS = {
  nome: 'Indeed Brasil',
  abrangencia: 'Estado do Paraná (PR)',
  atualizado: 'jun/2026',
  observacao:
    'Médias estaduais reportadas por trabalhadores. Bandeirantes não tem ' +
    'amostra própria; usamos a média do Paraná como referência regional.',
}

// media = salário-base médio mensal (R$) no PR. amostra = nº de relatos.
const SALARIOS_PR = [
  { cargo: 'Auxiliar Administrativo', media: 2006, amostra: 2600, aliases: ['adm', 'auxiliar administrativo', 'aux administrativo', 'administrativo', 'auxiliar adm'] },
  { cargo: 'Assistente Administrativo', media: 2254, amostra: 2100, aliases: ['assistente administrativo', 'assistente adm', 'assistente'] },
  { cargo: 'Vendedor', media: 2512, amostra: 7400, aliases: ['vendedor', 'vendedora', 'vendas', 'vendedor de loja'] },
  { cargo: 'Operador de Caixa', media: 1959, amostra: 3200, aliases: ['caixa', 'operador de caixa', 'operadora de caixa', 'caixa de loja'] },
  { cargo: 'Auxiliar de Produção', media: 1936, amostra: 5300, aliases: ['auxiliar de producao', 'aux producao', 'producao', 'auxiliar de fabrica'] },
  { cargo: 'Repositor', media: 1880, amostra: 705, aliases: ['repositor', 'repositora', 'repositor de mercadorias'] },
  { cargo: 'Motorista', media: 2498, amostra: 829, aliases: ['motorista', 'motorista entregador', 'condutor'] },
  { cargo: 'Recepcionista', media: 1971, amostra: 1600, aliases: ['recepcionista', 'recepcao'] },
  { cargo: 'Atendente', media: 1897, amostra: 1100, aliases: ['atendente', 'atendente de loja', 'balconista'] },
  { cargo: 'Pedreiro', media: 2667, amostra: 317, aliases: ['pedreiro'] },
  { cargo: 'Cozinheiro(a)', media: 2315, amostra: 1700, aliases: ['cozinheiro', 'cozinheira', 'cozinha', 'chefe de cozinha'] },
  { cargo: 'Servente de Obras', media: 2053, amostra: 167, aliases: ['servente', 'servente de obras', 'ajudante de obras', 'ajudante de pedreiro'] },
  { cargo: 'Garçom', media: 2148, amostra: 691, aliases: ['garcom', 'garconete', 'garcon'] },
]

// Referência geral do PR = média dos cargos catalogados (para cargos fora da lista).
export const REFERENCIA_GERAL_PR = Math.round(
  SALARIOS_PR.reduce((s, c) => s + c.media, 0) / SALARIOS_PR.length / 10
) * 10

// Remove acentos e normaliza para comparar.
export function normalizar(txt = '') {
  return txt
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // marcas de acento soltas do NFD
    .toLowerCase()
    .trim()
}

// Procura a média salarial para um cargo digitado livremente.
// Retorna { media, cargoEncontrado, amostra, estimado, fonte }.
export function buscarMediaSalarial(cargoDigitado) {
  const alvo = normalizar(cargoDigitado)

  if (alvo) {
    // 1) alias idêntico  2) alias contido no texto digitado (ou vice-versa)
    for (const item of SALARIOS_PR) {
      if (item.aliases.some((a) => a === alvo)) return achou(item)
    }
    for (const item of SALARIOS_PR) {
      if (item.aliases.some((a) => alvo.includes(a) || a.includes(alvo))) return achou(item)
    }
  }

  // Cargo não catalogado: devolve referência geral do estado, marcada como estimativa.
  return {
    media: REFERENCIA_GERAL_PR,
    cargoEncontrado: null,
    amostra: null,
    estimado: true,
    fonte: FONTE_SALARIOS,
  }
}

function achou(item) {
  return {
    media: item.media,
    cargoEncontrado: item.cargo,
    amostra: item.amostra,
    estimado: false,
    fonte: FONTE_SALARIOS,
  }
}
