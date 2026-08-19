import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [erroPerfil, setErroPerfil] = useState('')
  const [carregando, setCarregando] = useState(true)

  // Busca o perfil do usuário na tabela "profiles".
  // Importante distinguir dois casos:
  //  - perfil inexistente (data null, sem erro) => usuário vai ao onboarding
  //  - falha de rede/permissão (error)         => mostramos o erro e deixamos
  //    tentar de novo, em vez de jogar o usuário num onboarding sem fim.
  const carregarPerfil = useCallback(async (userId) => {
    if (!userId) { setProfile(null); setErroPerfil(''); return }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('[Coletiv] Falha ao carregar o perfil:', error)
      setErroPerfil('Não foi possível carregar seu perfil. Verifique sua conexão.')
      setProfile(null)
      return
    }
    setErroPerfil('')
    setProfile(data ?? null)
  }, [])

  // Inicializa a sessão e escuta mudanças de login/logout.
  useEffect(() => {
    let ativo = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!ativo) return
      setSession(data.session)
      await carregarPerfil(data.session?.user?.id)
      if (ativo) setCarregando(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evento, sessao) => {
      if (!ativo) return
      setSession(sessao)
      await carregarPerfil(sessao?.user?.id)
    })

    return () => { ativo = false; sub.subscription.unsubscribe() }
  }, [carregarPerfil])

  // --- Ações de autenticação ---
  const cadastrar = (email, senha) =>
    supabase.auth.signUp({ email, password: senha })

  const entrar = (email, senha) =>
    supabase.auth.signInWithPassword({ email, password: senha })

  const sair = () => supabase.auth.signOut()

  // Cria ou atualiza o perfil do usuário logado.
  const salvarPerfil = async (dados) => {
    const userId = session?.user?.id
    if (!userId) throw new Error('Sem usuário logado')
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...dados })
      .select()
      .single()
    if (error) throw error
    setErroPerfil('')
    setProfile(data)
    return data
  }

  const valor = {
    session,
    usuario: session?.user ?? null,
    profile,
    erroPerfil,
    carregando,
    cadastrar,
    entrar,
    sair,
    salvarPerfil,
    recarregarPerfil: () => carregarPerfil(session?.user?.id),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
