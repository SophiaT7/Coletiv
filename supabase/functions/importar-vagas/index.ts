// =====================================================================
// Edge Function: importar-vagas
// ---------------------------------------------------------------------
// Busca vagas na Adzuna para as cidades do Norte Pioneiro (PR) e grava
// (upsert) na tabela public.vagas. Feita para rodar de forma AGENDADA —
// veja supabase/agendar-vagas.sql.
//
// Segredos necessários (Project Settings > Edge Functions > Secrets):
//   ADZUNA_APP_ID   — seu App ID da Adzuna
//   ADZUNA_APP_KEY  — sua App Key da Adzuna
// Injetados automaticamente pelo runtime do Supabase:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// As chaves da Adzuna NUNCA vão para o navegador: ficam só aqui, no
// servidor. É por isso que a importação é uma função, e não um fetch no
// front (que exporia a chave no bundle e esbarraria em CORS).
//
// Deploy:   supabase functions deploy importar-vagas
// Testar:   supabase functions invoke importar-vagas
// =====================================================================
import { createClient } from 'npm:@supabase/supabase-js@2'

const PAIS = 'br'
// Onde procurar. distance = raio em km ao redor de cada cidade.
const CIDADES = [
  'Bandeirantes, Paraná',
  'Cornélio Procópio, Paraná',
  'Jacarezinho, Paraná',
  'Santa Mariana, Paraná',
]
const RAIO_KM = 50
const RESULTADOS_POR_CIDADE = 25
// Vagas não revistas há mais que isto são removidas (deixaram de existir na fonte).
const VALIDADE_DIAS = 14

// Categoria da Adzuna -> setor do Coletiv (bate com os setores do onboarding).
const SETOR_POR_CATEGORIA: Record<string, string> = {
  'retail-jobs': 'Comércio',
  'sales-jobs': 'Comércio',
  'manufacturing-jobs': 'Indústria',
  'engineering-jobs': 'Indústria',
  'energy-jobs': 'Indústria',
  'logistics-warehouse-jobs': 'Indústria',
  'hospitality-catering-jobs': 'Serviços',
  'admin-jobs': 'Serviços',
  'customer-services-jobs': 'Serviços',
  'healthcare-nursing-jobs': 'Serviços',
  'social-work-jobs': 'Serviços',
  'teaching-jobs': 'Serviços',
  'it-jobs': 'Serviços',
  'accounting-finance-jobs': 'Serviços',
  'domestic-help-cleaning-jobs': 'Serviços',
}

function setorDe(categoriaTag?: string): string {
  if (!categoriaTag) return 'Outro'
  return SETOR_POR_CATEGORIA[categoriaTag] ?? 'Outro'
}

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

Deno.serve(async () => {
  const appId = Deno.env.get('ADZUNA_APP_ID')
  const appKey = Deno.env.get('ADZUNA_APP_KEY')
  if (!appId || !appKey) {
    return json({ erro: 'Faltam os segredos ADZUNA_APP_ID / ADZUNA_APP_KEY.' }, 500)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Dedup por id: a mesma vaga pode aparecer no raio de mais de uma cidade.
  const porId = new Map<string, Record<string, unknown>>()
  const agora = new Date().toISOString()

  for (const onde of CIDADES) {
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${PAIS}/search/1`)
    url.searchParams.set('app_id', appId)
    url.searchParams.set('app_key', appKey)
    url.searchParams.set('where', onde)
    url.searchParams.set('distance', String(RAIO_KM))
    url.searchParams.set('results_per_page', String(RESULTADOS_POR_CIDADE))
    url.searchParams.set('content-type', 'application/json')

    const resp = await fetch(url)
    if (!resp.ok) {
      console.error(`Adzuna respondeu ${resp.status} para "${onde}"`)
      continue
    }

    const dados = await resp.json()
    for (const v of dados.results ?? []) {
      const id = `adzuna:${v.id}`
      porId.set(id, {
        id,
        fonte: 'adzuna',
        titulo: v.title ?? '',
        empresa: v.company?.display_name ?? '',
        local: v.location?.display_name ?? onde,
        setor: setorDe(v.category?.tag),
        salario_min: v.salary_min ?? null,
        salario_max: v.salary_max ?? null,
        descricao: v.description ?? '',
        url: v.redirect_url ?? null,
        publicada_em: v.created ?? null,
        importada_em: agora,
      })
    }
  }

  const vagas = [...porId.values()]
  if (vagas.length === 0) {
    return json({ ok: true, importadas: 0, aviso: 'Nenhuma vaga retornada pela Adzuna.' })
  }

  const { error } = await supabase.from('vagas').upsert(vagas, { onConflict: 'id' })
  if (error) {
    console.error('Falha ao gravar vagas:', error)
    return json({ erro: error.message }, 500)
  }

  // Limpa vagas antigas que não voltaram nas últimas importações.
  const limite = new Date(Date.now() - VALIDADE_DIAS * 86_400_000).toISOString()
  const { error: erroLimpeza } = await supabase.from('vagas').delete().lt('importada_em', limite)
  if (erroLimpeza) console.error('Falha ao limpar vagas antigas:', erroLimpeza)

  return json({ ok: true, importadas: vagas.length })
})
