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
- **Mapa de Oportunidades** — busca de vagas nos principais portais do país,
  com o cargo e a cidade do perfil já preenchidos
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
6. **Só em desenvolvimento**: em **Authentication → Sign In / Providers →
   Email**, desligue **Confirm email**. O email embutido do Supabase é de
   demonstração — limita 2 envios por hora e não entrega para endereços de
   teste, então sem desligar isso você não consegue entrar. Antes de publicar,
   religue e siga a seção [Colocando em produção](#colocando-em-produção).
7. Reinicie o servidor: `npm run dev`.

> Nunca use a chave `sb_secret_...` no front-end — ela ignora as regras de
> segurança do banco. O arquivo `.env` está no `.gitignore` de propósito.

## Colocando em produção

Em produção a confirmação de email precisa funcionar de verdade, e para isso o
Supabase tem que enviar pelo **seu** servidor de email, não pelo embutido.

1. **Domínio verificado.** Crie conta num serviço de email transacional
   (Resend, Postmark, SendGrid, Mailgun ou Amazon SES — os planos gratuitos
   cobrem um app novo com folga) e verifique o domínio de onde as mensagens
   vão sair. O serviço mostra os registros **SPF**, **DKIM** e **DMARC** para
   colar no DNS. Esse passo não é opcional: sem ele o email sai, mas o Gmail e
   o Outlook mandam direto para o spam. A propagação do DNS leva de minutos a
   algumas horas — deixe pronto antes do dia do lançamento.
2. **SMTP no Supabase.** Em **Project Settings → Authentication → SMTP
   Settings**, ligue *Enable Custom SMTP* e preencha host, porta, usuário e
   senha que o serviço forneceu. O remetente é um endereço do domínio
   verificado (ex.: `nao-responda@seudominio.com.br`).
3. **Rate limit.** Em **Authentication → Rate Limits**, suba o limite de emails
   por hora. Ele continua no valor de desenvolvimento até ser trocado na mão,
   mesmo com SMTP próprio configurado.
4. **Religue o Confirm email** (passo 6 da configuração inicial).
5. **URLs.** Em **Authentication → URL Configuration**, coloque a **Site URL**
   como o domínio de produção e liste em **Redirect URLs** todas as origens
   usadas: `http://localhost:5173/**` para o desenvolvimento e a URL de preview
   da hospedagem, se houver. O cadastro manda o usuário de volta para a origem
   de onde ele saiu (`emailRedirectTo` em `context/AuthContext.jsx`), e origem
   fora dessa lista é recusada.
6. **Rewrite da SPA.** A hospedagem precisa servir o `index.html` em qualquer
   rota — os arquivos `public/_redirects` (Netlify, Cloudflare Pages) e
   `vercel.json` (Vercel) já estão no repositório. Sem isso o link do email dá
   404 antes de o app conseguir ler o token da URL.
7. **Troque `SEU-DOMINIO`** pelas duas tags `og:url` e `og:image` do
   [`index.html`](index.html). Os leitores de link (WhatsApp, Facebook,
   LinkedIn) exigem URL absoluta e ignoram caminho relativo — enquanto o
   placeholder estiver lá, o link compartilhado sai sem o cartão de
   pré-visualização.

Para conferir, cadastre um endereço real, confirme pelo link do email e veja se
ele cai no onboarding. Vale checar também a caixa de spam do Gmail e do
Outlook — se cair lá, o problema está nos registros de DNS do passo 1.

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
│   ├── sitesEmprego.js     portais de emprego do Mapa de Oportunidades
│   └── trabalhador.js      catálogo: cursos e enquetes
├── components/             Layout, Cabecalho, Icone, RotaProtegida,
│                        LimiteDeErro (tela de falha do app inteiro)
└── pages/                  Login, Onboarding e as 9 telas do app

supabase/
└── schema.sql              tabelas, RLS e constraints
```

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

- O **Mapa de Oportunidades** leva para a busca dos portais; o app não
  hospeda vagas nem ordena por compatibilidade. Os portais não oferecem API
  pública, e raspar o site deles esbarra nos termos de uso — em cidade
  pequena o volume também seria baixo demais para um "match" significar algo.
- Os **cursos** apontam para o catálogo do parceiro; o Coletiv não hospeda
  nem acompanha o progresso.
- O **relatório** usa regras determinísticas, não um modelo de IA.
- "Apagar meus dados" remove o perfil e os votos da Assembleia; excluir a
  conta de login em si exige acesso administrativo ao Supabase.
