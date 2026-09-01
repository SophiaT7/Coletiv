-- =====================================================================
-- Coletiv — Banco de dados (Supabase / PostgreSQL)
-- Cole TODO este conteúdo no Supabase > SQL Editor e clique em "Run".
-- Pode rodar de novo quantas vezes quiser: o script é idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) PERFIS — 1 linha por usuário, ligada ao login (auth.users).
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  cargo text not null default '',
  cidade text default '',
  setor text default 'Serviços',
  salario numeric default 0,
  jornada_semanal_horas numeric default 44,
  horas_trabalhadas_semana numeric default 0,
  horas_extras_semana numeric default 0,
  created_at timestamptz default now()
);

-- Respostas sobre direitos. NULL = "não informado" — o app nunca inventa
-- um alerta a partir de um campo em branco.
alter table public.profiles add column if not exists carteira_assinada boolean;
alter table public.profiles add column if not exists ferias_em_dia boolean;
alter table public.profiles add column if not exists decimo_terceiro_em_dia boolean;
alter table public.profiles add column if not exists intervalo_respeitado boolean;
alter table public.profiles add column if not exists descanso_semanal boolean;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Faixas válidas (168 = horas de uma semana).
alter table public.profiles drop constraint if exists profiles_salario_valido;
alter table public.profiles add constraint profiles_salario_valido
  check (salario >= 0 and salario <= 1000000);

alter table public.profiles drop constraint if exists profiles_horas_validas;
alter table public.profiles add constraint profiles_horas_validas
  check (
    jornada_semanal_horas between 0 and 168
    and horas_trabalhadas_semana between 0 and 168
    and horas_extras_semana between 0 and 168
  );

-- Mantém updated_at sempre correto (sem depender do cliente).
create or replace function public.tocar_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.tocar_updated_at();

-- Segurança em nível de linha (RLS).
alter table public.profiles enable row level security;

-- Cada usuário só pode VER o próprio perfil.
drop policy if exists "ver proprio perfil" on public.profiles;
create policy "ver proprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Cada usuário só pode CRIAR o próprio perfil.
drop policy if exists "criar proprio perfil" on public.profiles;
create policy "criar proprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cada usuário só pode ATUALIZAR o próprio perfil.
-- O "with check" é essencial: sem ele o usuário poderia trocar o id da
-- própria linha pelo de outra pessoa ao salvar.
drop policy if exists "atualizar proprio perfil" on public.profiles;
create policy "atualizar proprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cada usuário pode APAGAR os próprios dados (LGPD).
drop policy if exists "apagar proprio perfil" on public.profiles;
create policy "apagar proprio perfil"
  on public.profiles for delete
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2) VOTOS DA ASSEMBLEIA — 1 voto por usuário em cada enquete.
-- ---------------------------------------------------------------------
create table if not exists public.votos (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  enquete_id integer not null,
  opcao integer not null check (opcao >= 0),
  created_at timestamptz default now(),
  primary key (usuario_id, enquete_id)
);

alter table public.votos enable row level security;

-- Todos os usuários logados leem todos os votos (é assim que o app conta
-- o resultado). Não há dado pessoal aqui além do id de quem votou.
drop policy if exists "ver votos" on public.votos;
create policy "ver votos"
  on public.votos for select
  to authenticated
  using (true);

-- Cada usuário só registra o próprio voto.
drop policy if exists "registrar proprio voto" on public.votos;
create policy "registrar proprio voto"
  on public.votos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

-- Pode trocar o próprio voto, nunca o de outra pessoa.
drop policy if exists "trocar proprio voto" on public.votos;
create policy "trocar proprio voto"
  on public.votos for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

-- Pode apagar o próprio voto. É o que permite o "Apagar meus dados" do
-- Perfil levar embora TUDO que a pessoa gerou no app, e não só o perfil.
drop policy if exists "apagar proprio voto" on public.votos;
create policy "apagar proprio voto"
  on public.votos for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- Publica a tabela no Realtime: é isso que faz o resultado da Assembleia
-- se mover na tela de todo mundo enquanto as pessoas votam. Sem esta
-- linha o app funciona, mas só atualiza ao recarregar a página.
-- (O "if not exists" evita erro ao rodar o script mais de uma vez.)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'votos'
  ) then
    alter publication supabase_realtime add table public.votos;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 3) APAGAR A PRÓPRIA CONTA (LGPD)
--    O app não pode apagar de auth.users com a chave publicável — isso
--    exige privilégio administrativo, e a chave de service role jamais
--    pode ir para o navegador. Esta função roda com os privilégios do
--    dono (security definer) e só alcança QUEM ESTÁ CHAMANDO: o id vem
--    de auth.uid(), nunca de um parâmetro, então não há como pedir a
--    exclusão de outra pessoa.
--
--    O perfil e os votos somem junto por causa do "on delete cascade"
--    das duas tabelas — por isso o app faz uma chamada só.
--
--    O "set search_path" vazio é obrigatório numa função security
--    definer: sem ele, alguém poderia criar um objeto com nome igual
--    num schema à frente no caminho e fazer a função executá-lo.
-- ---------------------------------------------------------------------
create or replace function public.apagar_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sem usuario autenticado';
  end if;

  delete from auth.users where id = uid;

  -- Se nada foi apagado, a conta nao existe mais (ou o delete falhou).
  -- Levantar erro aqui e o que impede o app de anunciar uma exclusao
  -- que nao aconteceu.
  if not found then
    raise exception 'Conta nao encontrada';
  end if;
end $$;

-- Ninguém deslogado pode chamar; quem está logado só apaga a si mesmo.
revoke all on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;

-- ---------------------------------------------------------------------
-- 4) LIMPEZA — a tabela "vagas" foi removida do app.
--    O Mapa de Oportunidades agora só leva para a busca dos portais de
--    emprego; nada de vaga é importado ou guardado aqui. Este drop existe
--    para limpar quem rodou uma versão anterior do schema.
-- ---------------------------------------------------------------------
drop table if exists public.vagas;

