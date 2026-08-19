// Catálogo do app (cursos, vagas, enquetes).
// O PERFIL do usuário vem do Supabase (tabela "profiles").
// Os salários médios reais ficam em ./salarios.js
// As regras de direitos e sobrecarga ficam em ./analise.js
import { normalizar } from './salarios.js'

// ---------------------------------------------------------------------
// Cursos do "Centro de Capacitação"
// Links para catálogos de cursos gratuitos de verdade. Apontamos para a
// página do parceiro (e não para uma aula específica) para o link não
// morrer quando a instituição reorganizar o site.
// ---------------------------------------------------------------------
export const cursos = [
  {
    id: 1,
    titulo: 'Informática e ferramentas digitais',
    area: 'Tecnologia',
    instituicao: 'Fundação Bradesco — Escola Virtual',
    url: 'https://www.ev.org.br/cursos',
  },
  {
    id: 2,
    titulo: 'Comunicação e atendimento',
    area: 'Comunicação',
    instituicao: 'Sebrae — Cursos online',
    url: 'https://sebrae.com.br/sites/PortalSebrae/cursosonline',
  },
  {
    id: 3,
    titulo: 'Educação financeira',
    area: 'Finanças',
    instituicao: 'Fundação Bradesco — Escola Virtual',
    url: 'https://www.ev.org.br/cursos',
  },
  {
    id: 4,
    titulo: 'Empreendedorismo e formalização (MEI)',
    area: 'Empreendedorismo',
    instituicao: 'Sebrae — Cursos online',
    url: 'https://sebrae.com.br/sites/PortalSebrae/cursosonline',
  },
]

// ---------------------------------------------------------------------
// Vagas do "Mapa de Oportunidades"
// As vagas vêm da tabela "vagas" no Supabase, preenchida pela Edge Function
// "importar-vagas" (fonte: Adzuna). Aqui ficam só as regras que ordenam
// essas vagas pelo perfil do usuário — nada é fixo no código.
// ---------------------------------------------------------------------

// Compatibilidade calculada a partir do perfil.
// 50 de base + 30 se o setor bate + 20 se o cargo bate (10 se bate parcial).
export function compatibilidade(vaga, perfil = {}) {
  let pontos = 50
  if (perfil.setor && vaga.setor && normalizar(perfil.setor) === normalizar(vaga.setor)) pontos += 30

  const cargo = normalizar(perfil.cargo)
  const titulo = normalizar(vaga.titulo)
  if (cargo && (titulo.includes(cargo) || cargo.includes(titulo))) pontos += 20
  else if (cargo && titulo.split(' ').some((p) => p.length > 3 && cargo.includes(p))) pontos += 10

  return Math.min(pontos, 100)
}

// Recebe as vagas já lidas do banco e devolve ordenadas pela compatibilidade.
export function ordenarPorCompatibilidade(vagas, perfil) {
  return (vagas ?? [])
    .map((v) => ({ ...v, compat: compatibilidade(v, perfil) }))
    .sort((a, b) => b.compat - a.compat)
}

// ---------------------------------------------------------------------
// Enquetes da "Assembleia Digital"
// As perguntas ficam aqui; os VOTOS vêm da tabela "votos" no Supabase.
// ---------------------------------------------------------------------
export const enquetes = [
  {
    id: 1,
    pergunta: 'Você apoia a redução da jornada de trabalho sem redução salarial?',
    opcoes: ['Sim, apoio', 'Tenho dúvidas', 'Não apoio'],
  },
  {
    id: 2,
    pergunta: 'Qual é o maior desafio no seu trabalho hoje?',
    opcoes: ['Sobrecarga de horas', 'Salário baixo', 'Falta de reconhecimento'],
  },
]
