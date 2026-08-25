// ---------------------------------------------------------------------
// Sites de emprego — o conteúdo do Mapa de Oportunidades.
//
// O app não hospeda vagas: manda a pessoa para os grandes portais já com
// a busca preenchida com o cargo e a cidade do perfil dela. Nenhum desses
// portais oferece API pública de vagas, e raspar o HTML deles esbarra nos
// termos de uso — o link de busca é o caminho honesto.
//
// Cada site tem uma função `busca(cargo, cidade)`. Quando o site aceita
// a busca pela URL, montamos a busca; quando não aceita (ou o perfil
// ainda não tem cargo), caímos na página de busca do próprio site — um
// link que não quebra vale mais que um filtro bonito que dá 404.
// ---------------------------------------------------------------------
import { normalizar } from './salarios.js'

// "Auxiliar Administrativo" -> "auxiliar-administrativo"
function paraSlug(txt = '') {
  return normalizar(txt).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const q = encodeURIComponent

export const sitesEmprego = [
  {
    id: 'emprega-brasil',
    nome: 'Emprega Brasil (SINE)',
    descricao: 'Portal oficial do governo federal. Vagas do SINE e seguro-desemprego no mesmo lugar.',
    selo: 'Gratuito',
    // Exige login pelo gov.br e a busca acontece dentro do sistema,
    // então não dá para pré-preencher pela URL.
    busca: () => 'https://empregabrasil.mte.gov.br/',
  },
  {
    id: 'indeed',
    nome: 'Indeed',
    descricao: 'O maior agregador do país — reúne anúncios de vários outros sites.',
    selo: 'Gratuito',
    busca: (cargo, cidade) =>
      `https://br.indeed.com/jobs?q=${q(cargo)}${cidade ? `&l=${q(cidade)}` : ''}`,
  },
  {
    id: 'vagas',
    nome: 'Vagas.com.br',
    descricao: 'Tradicional no mercado brasileiro, forte em comércio e indústria.',
    selo: 'Gratuito',
    busca: (cargo) =>
      cargo ? `https://www.vagas.com.br/vagas-de-${paraSlug(cargo)}` : 'https://www.vagas.com.br/vagas',
  },
  {
    id: 'infojobs',
    nome: 'InfoJobs',
    descricao: 'Bastante usado por empresas de médio porte para vagas operacionais.',
    selo: 'Gratuito',
    busca: (cargo) => `https://www.infojobs.com.br/empregos.aspx?palabra=${q(cargo)}`,
  },
  {
    id: 'gupy',
    nome: 'Gupy',
    descricao: 'Onde muitas empresas grandes publicam. A candidatura é feita direto com a empresa.',
    selo: 'Gratuito',
    busca: (cargo) =>
      cargo ? `https://portal.gupy.io/job-search/term=${q(cargo)}` : 'https://portal.gupy.io/',
  },
  {
    id: 'linkedin',
    nome: 'LinkedIn',
    descricao: 'Mais voltado a vagas administrativas e de escritório.',
    selo: 'Gratuito',
    busca: (cargo, cidade) =>
      `https://www.linkedin.com/jobs/search/?keywords=${q(cargo)}${cidade ? `&location=${q(cidade)}` : ''}`,
  },
  {
    id: 'catho',
    nome: 'Catho',
    descricao: 'Grande volume de vagas, mas se candidatar exige assinatura paga na maioria delas.',
    selo: 'Exige assinatura',
    pago: true,
    busca: (cargo) =>
      cargo ? `https://www.catho.com.br/vagas/${paraSlug(cargo)}/` : 'https://www.catho.com.br/vagas/',
  },
]

// Monta os links já com o cargo e a cidade do perfil.
// Sem cargo, o termo vira "vagas de emprego" para a busca não sair vazia.
export function linksDeEmprego(profile) {
  const cargo = (profile?.cargo ?? '').trim()
  const cidade = (profile?.cidade ?? '').trim()
  const termo = cargo || 'vagas de emprego'
  return sitesEmprego.map((site) => ({
    ...site,
    url: site.busca(termo, cidade),
  }))
}
