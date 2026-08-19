import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Aviso amigável caso o .env não esteja preenchido.
export const supabaseConfigurado = Boolean(url && anonKey)

if (!supabaseConfigurado) {
  console.warn(
    '[Coletiv] Supabase não configurado. Preencha VITE_SUPABASE_URL e ' +
    'VITE_SUPABASE_ANON_KEY no arquivo .env e reinicie o servidor.'
  )
}

// Se não houver config, criamos um client com valores vazios só para não quebrar
// a importação; as telas mostram um aviso até o .env ser preenchido.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key'
)
