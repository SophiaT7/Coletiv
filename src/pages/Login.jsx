import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabaseConfigurado } from '../lib/supabase.js'
import './Login.css'

export default function Login() {
  const { entrar, cadastrar } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'cadastrar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro(''); setAviso('')

    if (!supabaseConfigurado) {
      setErro('Supabase ainda não configurado. Preencha o arquivo .env e reinicie o servidor.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setCarregando(true)
    try {
      if (modo === 'entrar') {
        const { error } = await entrar(email, senha)
        if (error) throw error
        navigate('/')
      } else {
        const { data, error } = await cadastrar(email, senha)
        if (error) throw error
        // Se a confirmação de email estiver desligada, já vem com sessão.
        if (data.session) navigate('/onboarding')
        else setAviso('Conta criada! Verifique seu email para confirmar e depois faça login.')
      }
    } catch (err) {
      setErro(traduzErro(err))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-tela">
      <div className="login-marca">
        <div className="login-logo">C</div>
        <h1>Coletiv</h1>
        <p>Tecnologia a serviço de quem trabalha</p>
      </div>

      <form className="card login-form" onSubmit={enviar}>
        <h2>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h2>

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} required autoComplete="email"
          onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />

        <label htmlFor="senha">Senha</label>
        <input id="senha" type="password" value={senha} required
          autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          onChange={(e) => setSenha(e.target.value)} placeholder="mínimo 6 caracteres" />

        {erro && <p className="login-erro">{erro}</p>}
        {aviso && <p className="login-aviso">{aviso}</p>}

        <button className="btn" disabled={carregando}>
          {carregando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      <p className="login-troca">
        {modo === 'entrar' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
        <button onClick={() => { setModo(modo === 'entrar' ? 'cadastrar' : 'entrar'); setErro(''); setAviso('') }}>
          {modo === 'entrar' ? 'Cadastre-se' : 'Entrar'}
        </button>
      </p>
    </div>
  )
}

// Recebe o erro inteiro (e não só a mensagem) porque o status importa:
// falha de servidor costuma vir com corpo vazio, e aí não há texto nenhum
// para mostrar.
function traduzErro(erro) {
  const msg = typeof erro?.message === 'string' ? erro.message : ''

  if (msg.includes('Invalid login')) return 'Email ou senha incorretos.'
  if (msg.includes('already registered')) return 'Este email já está cadastrado.'
  if (msg.includes('confirm')) return 'Confirme seu email antes de entrar.'
  if (erro?.status === 429 || msg.includes('rate limit')) {
    return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'
  }
  // 5xx no cadastro é quase sempre o envio do email de confirmação falhando.
  // Não é problema do que a pessoa digitou, então não faz sentido mandá-la
  // conferir os campos.
  if (erro?.status >= 500) {
    return 'Não foi possível concluir agora — o servidor não respondeu. ' +
      'Tente de novo em alguns minutos.'
  }
  // Descarta corpo de resposta sem conteúdo ("{}", "[]"), que chegava até a
  // tela como se fosse mensagem de erro.
  const util = /^[\s{}[\]]*$/.test(msg) ? '' : msg.trim()
  return util || 'Algo deu errado. Tente novamente.'
}
