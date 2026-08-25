// Catálogo do app (cursos e enquetes).
// O PERFIL do usuário vem do Supabase (tabela "profiles").
// Os salários médios reais ficam em ./salarios.js
// As regras de direitos e sobrecarga ficam em ./analise.js

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
