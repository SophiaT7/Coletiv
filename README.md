# Coletiv

> Feito para servir a Deus e aos pequenos empreendedores.

Aplicativo desenvolvido para apoiar trabalhadores e pequenos empreendedores de
diferentes setores (comércio, indústria, serviços e trabalho informal),
oferecendo informação, proteção e oportunidades de crescimento por meio da
tecnologia.

## Funcionalidades

- **Dashboard** — visão geral da situação profissional
- **Radar de Direitos** — avalia 7 direitos a partir do que você informa;
  o que não foi respondido aparece como *não informado*, nunca como alerta
- **Calculadora de Valorização** — compara o salário com a média do Paraná
- **Detector de Sobrecarga** — analisa a jornada e o risco de esgotamento
- **Centro de Capacitação** — links para cursos gratuitos de parceiros
- **Mapa de Oportunidades** — vagas reais da região (via Adzuna), ordenadas
  pela compatibilidade calculada a partir do perfil
- **Relatório personalizado** — junta as análises acima num resumo
- **Assembleia Digital** — enquetes com votos salvos no Supabase e resultado
  atualizando ao vivo entre os participantes (Realtime)
- **Perfil** — dados, privacidade e exclusão dos próprios dados

### Princípio das análises

O app **nunca afirma irregularidade sem base**. Toda regra vive em
[`src/data/analise.js`](src/data/analise.js) e trabalha com três estados:
`ok`, `alerta` e `sem-dados`. Campo em branco no perfil vira `sem-dados` —
nunca `alerta`. As referências legais usadas (jornada de 44h, limite de horas
extras, intervalo intrajornada, descanso semanal) estão comentadas no arquivo.

## Tecnologias

- React 19 + Vite
- React Router
- Supabase (autenticação e banco de dados)

## Backend (Supabase) — configuração inicial

O app usa o **Supabase** para login e banco de dados. Configure uma vez:

1. Crie uma conta grátis em <https://supabase.com> e clique em **New project**.
2. Dê um nome (ex.: `coletiv`), defina uma senha de banco e crie. Aguarde ~1 min.
3. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - a chave **publishable** (`sb_publishable_...`) ou a **anon public** (`eyJ...`)
4. Na raiz do projeto, copie `.env.example` para `.env` e cole os valores:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-publicavel
   ```
5. Vá em **SQL Editor → New query**, cole TODO o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
   Isso cria a tabela `profiles`, a tabela `votos` e as regras de segurança.
   **O script é idempotente** — pode rodar de novo a cada atualização do
   projeto, e é preciso rodá-lo sempre que o schema mudar.
6. (Opcional, recomendado p/ testes) Em **Authentication → Providers → Email**,
   desligue **Confirm email** para conseguir entrar sem confirmar o email.
7. Reinicie o servidor: `npm run dev`.

> Nunca use a chave `sb_secret_...` no front-end — ela ignora as regras de
> segurança do banco. O arquivo `.env` está no `.gitignore` de propósito.

## Como rodar

```bash
npm install      # instala as dependências
npm run dev      # inicia o servidor de desenvolvimento (http://localhost:5173)
npm run lint     # verifica o código
npm run build    # gera a versão de produção
```

## Estrutura

```
src/
├── App.jsx                 rotas
├── main.jsx                ponto de entrada
├── index.css               design system (cores da marca)
├── lib/supabase.js         client do Supabase
├── context/AuthContext.jsx sessão, perfil e ações de login
├── data/
│   ├── analise.js          regras de direitos e sobrecarga
│   ├── salarios.js         médias salariais do Paraná (com fonte)
│   └── trabalhador.js      catálogo: cursos, vagas e enquetes
├── components/             Layout, Cabecalho, Icone, RotaProtegida
└── pages/                  Login, Onboarding e as 9 telas do app

supabase/
├── schema.sql              tabelas, RLS e constraints
├── agendar-vagas.sql       agenda a importação de vagas (roda 1x)
└── functions/
    └── importar-vagas/     Edge Function que busca vagas na Adzuna
```

## Vagas reais (Adzuna)

O Mapa de Oportunidades lê da tabela `vagas`, que é preenchida por uma
**Edge Function** ([`supabase/functions/importar-vagas`](supabase/functions/importar-vagas/index.ts))
rodando de forma agendada. O navegador nunca fala com a Adzuna: a chave fica
só no servidor. Para ligar em produção:

1. Crie uma conta em <https://developer.adzuna.com> e pegue seu **App ID** e
   **App Key** (o plano gratuito basta).
2. Cadastre os dois como **segredos da função** (não no `.env` do front, que
   viraria bundle público):
   ```bash
   supabase secrets set ADZUNA_APP_ID=seu-app-id ADZUNA_APP_KEY=sua-app-key
   ```
   (ou em **Project Settings → Edge Functions → Secrets** no painel).
3. Rode o [`supabase/schema.sql`](supabase/schema.sql) (cria a tabela `vagas`,
   se ainda não rodou depois desta atualização).
4. Faça o deploy da função:
   ```bash
   supabase functions deploy importar-vagas
   ```
5. Teste uma importação manual e confira a tabela:
   ```bash
   supabase functions invoke importar-vagas
   ```
6. Agende para rodar sozinha a cada 6h: abra
   [`supabase/agendar-vagas.sql`](supabase/agendar-vagas.sql), siga os
   comentários (guardar URL + service role key no Vault) e rode no SQL Editor.

Enquanto a função não tiver rodado, a tela mostra "Nenhuma vaga por enquanto"
— não quebra. As cidades buscadas, o raio e o de-para de setor estão no topo
do [`index.ts`](supabase/functions/importar-vagas/index.ts), fáceis de ajustar.

> A `service_role` key (`sb_secret_...`) só aparece no agendamento do banco e
> nos segredos da função — **nunca** no código do front nem no `.env`.

## Arquitetura do bundle

O build sai em três arquivos, definidos em [`vite.config.js`](vite.config.js):

| Chunk | gzip | Muda quando |
|---|---|---|
| `react` | ~74 kB | você atualiza React / React Router |
| `supabase` | ~51 kB | você atualiza o SDK do Supabase |
| `index` (app) | ~13 kB | você mexe em qualquer tela |

A divisão é por **ritmo de mudança**, não por rota. O motivo: o código do app
inteiro é só 13 kB gzip — quebrá-lo em 11 chunks de ~1 kB troca um download
por onze requisições e ainda coloca uma piscada de carregamento no caminho
mais usado (login → dashboard). Já separar as dependências rende cache real:
publicar uma correção de tela faz o usuário rebaixar 13 kB, não 138 kB.

Se um dia o app crescer (uns 40 kB gzip de código próprio, ou uma tela que
puxe uma biblioteca pesada de gráficos/PDF), aí vale carregar as telas
secundárias com `React.lazy` e disparar o `import()` no `onPointerEnter`
dos atalhos do Dashboard, para o chunk chegar antes do clique.

### Sobre o peso do Supabase

`createClient` instancia `RealtimeClient` e `StorageClient` no construtor, então
realtime, storage, functions e phoenix (~25 kB gzip) entram no bundle mesmo sem
uso — não há como tree-shakear. A escolha aqui foi **usar** o realtime: a
Assembleia assina a tabela `votos` e os resultados se movem ao vivo. Storage e
functions continuam sobrando; se um dia o tamanho apertar, dá para montar o
client direto com `@supabase/auth-js` + `@supabase/postgrest-js` e economizar
~29 kB gzip, ao custo de sair da documentação oficial.

## Limitações conhecidas

- As **vagas** dependem da cobertura da Adzuna na região; em cidades muito
  pequenas o volume pode ser baixo (a busca usa um raio de 50 km para ajudar).
- Os **cursos** apontam para o catálogo do parceiro; o Coletiv não hospeda
  nem acompanha o progresso.
- O **relatório** usa regras determinísticas, não um modelo de IA.
- "Apagar meus dados" remove o perfil e os dados do app; excluir a conta de
  login em si exige acesso administrativo ao Supabase.
