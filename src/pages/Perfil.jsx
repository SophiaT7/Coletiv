import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Cabecalho from '../components/Cabecalho.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function Perfil() {
  const { profile, usuario, sair } = useAuth()
  const navigate = useNavigate()
  const [verPrivacidade, setVerPrivacidade] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [erro, setErro] = useState('')
  const t = profile
  const inicial = (t.nome || '?').trim().charAt(0).toUpperCase() || '?'

  async function sairConta() {
    await sair()
    navigate('/login')
  }

  // LGPD: o usuário precisa conseguir apagar o que informou. A remoção da
  // conta de login em si depende do servidor, então explicamos isso.
  async function apagarDados() {
    const ok = window.confirm(
      'Isso apaga em definitivo seu perfil (nome, cargo, salário, jornada e ' +
      'respostas sobre direitos). Não dá para desfazer. Deseja continuar?',
    )
    if (!ok) return

    setErro(''); setApagando(true)
    const { error } = await supabase.from('profiles').delete().eq('id', usuario.id)
    if (error) {
      console.error('[Coletiv] Falha ao apagar o perfil:', error)
      setErro('Não foi possível apagar seus dados. Tente de novo.')
      setApagando(false)
      return
    }
    await sair()
    navigate('/login')
  }

  return (
    <div className="tela">
      <Cabecalho titulo="Perfil do Trabalhador" />

      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 10px',
          background: 'var(--azul)', color: '#fff', display: 'grid', placeItems: 'center',
          fontSize: 28, fontWeight: 700,
        }}>
          {inicial}
        </div>
        <strong style={{ fontSize: 18 }}>{t.nome || 'Sem nome'}</strong>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)' }}>{t.cargo}</p>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)' }}>{t.cidade}</p>
        <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 4 }}>{usuario?.email}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        <Link to="/onboarding" className="card" style={linha}>
          <span style={{ fontSize: 22 }}>📄</span>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 14 }}>Meus dados</strong>
            <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>Profissão, jornada, salário e direitos</p>
          </div>
          <span style={{ color: 'var(--texto-suave)' }}>›</span>
        </Link>

        <button className="card" style={linha} onClick={() => setVerPrivacidade(!verPrivacidade)}
          aria-expanded={verPrivacidade}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 14 }}>Privacidade</strong>
            <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>Como usamos seus dados</p>
          </div>
          <span style={{ color: 'var(--texto-suave)' }}>{verPrivacidade ? '⌄' : '›'}</span>
        </button>

        {verPrivacidade && (
          <div className="card" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--texto-suave)' }}>
            <p style={{ marginBottom: 8 }}>
              Seus dados de perfil ficam guardados na sua conta e só você
              consegue lê-los — o banco aplica essa regra por usuário.
            </p>
            <p style={{ marginBottom: 8 }}>
              As análises (direitos, sobrecarga, salário) são calculadas no seu
              próprio aparelho, a partir do que você informou. Nada é enviado
              para terceiros e nada é usado para publicidade.
            </p>
            <p>
              Na Assembleia, seu voto fica ligado à sua conta para você poder
              trocá-lo; os demais usuários veem apenas os totais.
            </p>
          </div>
        )}
      </div>

      {erro && <p className="msg-erro" style={{ marginTop: 16 }}>{erro}</p>}

      <button onClick={sairConta} className="btn secundario" style={{ marginTop: 20 }}>
        Sair da conta
      </button>

      <button onClick={apagarDados} disabled={apagando} className="btn"
        style={{ marginTop: 10, color: 'var(--vermelho)', background: '#fee2e2' }}>
        {apagando ? 'Apagando...' : 'Apagar meus dados'}
      </button>
      <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 8, lineHeight: 1.5 }}>
        Apagar remove todo o seu perfil deste app. O email de login continua
        cadastrado no Supabase — para excluí-lo também, fale com o
        administrador do projeto.
      </p>
    </div>
  )
}

const linha = {
  display: 'flex', alignItems: 'center', gap: 12,
  textAlign: 'left', width: '100%',
}
