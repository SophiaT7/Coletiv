-- =====================================================================
-- Agendamento da importação de vagas (Edge Function "importar-vagas").
-- ---------------------------------------------------------------------
-- Rode este arquivo UMA vez no SQL Editor DEPOIS de:
--   1) ter criado a tabela "vagas" (está no schema.sql);
--   2) ter feito o deploy da função:  supabase functions deploy importar-vagas
--   3) ter cadastrado os segredos ADZUNA_APP_ID e ADZUNA_APP_KEY
--      em Project Settings > Edge Functions > Secrets.
--
-- Ele agenda a função para rodar a cada 6 horas usando pg_cron + pg_net.
-- =====================================================================

-- Extensões necessárias (também dá para ligar em Database > Extensions).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------
-- Guarde a URL da função e a service role key no Vault, para não deixar
-- a chave em texto puro no agendamento. Rode os dois comandos abaixo
-- UMA vez, trocando os valores pelos do SEU projeto:
--
--   Project Settings > API  ->  service_role key (a secreta, sb_secret_...)
--   A URL é sempre  https://SEU-PROJETO.supabase.co/functions/v1/importar-vagas
--
-- select vault.create_secret(
--   'https://SEU-PROJETO.supabase.co/functions/v1/importar-vagas',
--   'url_importar_vagas'
-- );
-- select vault.create_secret('SUA_SERVICE_ROLE_KEY', 'service_role_key');
-- ---------------------------------------------------------------------

-- Remove um agendamento anterior com o mesmo nome (deixa o script repetível).
select cron.unschedule('importar-vagas')
where exists (select 1 from cron.job where jobname = 'importar-vagas');

-- Agenda: minuto 0, a cada 6 horas.
select cron.schedule(
  'importar-vagas',
  '0 */6 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'url_importar_vagas'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    )
  );
  $$
);

-- Para conferir/mexer depois:
--   select * from cron.job;                       -- ver o agendamento
--   select * from cron.job_run_details            -- ver execuções recentes
--     order by start_time desc limit 10;
--   select cron.unschedule('importar-vagas');     -- cancelar
