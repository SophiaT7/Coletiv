import { useNavigate } from 'react-router-dom'

// Cabeçalho das telas internas, com botão de voltar.
export default function Cabecalho({ titulo }) {
  const navigate = useNavigate()
  return (
    <header style={estilo.header}>
      <button onClick={() => navigate(-1)} style={estilo.voltar} aria-label="Voltar">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <h1 style={estilo.titulo}>{titulo}</h1>
    </header>
  )
}

const estilo = {
  header: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 0 12px',
  },
  voltar: {
    display: 'grid', placeItems: 'center',
    width: 38, height: 38, borderRadius: 12,
    background: '#fff', color: 'var(--texto)', boxShadow: 'var(--sombra)',
  },
  titulo: { fontSize: 18, fontWeight: 700 },
}
