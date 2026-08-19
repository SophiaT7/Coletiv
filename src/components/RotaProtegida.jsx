import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Carregando() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--texto-suave)' }}>
      Carregando...
    </div>
  )
}

// Mostrada quando o perfil existe (ou pode existir) mas não pôde ser lido.
// Sem isso, uma falha de rede empurraria o usuário para o onboarding
// repetidamente, como se ele nunca tivesse preenchido nada.
function FalhaPerfil({ mensagem, aoTentarDeNovo }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Ops!</p>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 16 }}>{mensagem}</p>
        <button className="btn" onClick={aoTentarDeNovo}>Tentar de novo</button>
      </div>
    </div>
  )
}

// Exige usuário logado E com perfil preenchido.
export function RotaProtegida() {
  const { usuario, profile, erroPerfil, carregando, recarregarPerfil } = useAuth()
  if (carregando) return <Carregando />
  if (!usuario) return <Navigate to="/login" replace />
  if (erroPerfil) return <FalhaPerfil mensagem={erroPerfil} aoTentarDeNovo={recarregarPerfil} />
  if (!profile) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

// Exige apenas usuário logado (usado no onboarding).
export function RotaLogada() {
  const { usuario, carregando } = useAuth()
  if (carregando) return <Carregando />
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}

// Páginas públicas (login): se já logado, manda para dentro do app.
export function RotaPublica() {
  const { usuario, profile, carregando } = useAuth()
  if (carregando) return <Carregando />
  if (usuario) return <Navigate to={profile ? '/' : '/onboarding'} replace />
  return <Outlet />
}
