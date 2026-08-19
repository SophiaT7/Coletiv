import Cabecalho from '../components/Cabecalho.jsx'
import { cursos } from '../data/trabalhador.js'
import { IconeLivro } from '../components/Icone.jsx'

export default function Capacitacao() {
  return (
    <div className="tela">
      <Cabecalho titulo="Centro de Capacitação" />

      <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 12 }}>
        Cursos gratuitos de instituições parceiras. Os links abrem o site da
        instituição, onde você faz a inscrição.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cursos.map((c) => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: 'var(--azul-claro)', color: 'var(--azul)',
                display: 'grid', placeItems: 'center',
              }}>
                <IconeLivro tamanho={22} />
              </span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 15 }}>{c.titulo}</strong>
                <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  {c.area} · {c.instituicao}
                </p>
              </div>
              <span className="badge ok" style={{ flexShrink: 0 }}>Gratuito</span>
            </div>

            <a className="btn secundario" href={c.url} target="_blank" rel="noopener noreferrer"
              style={{ marginTop: 12 }}>
              Abrir no site da instituição ↗
            </a>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 16, lineHeight: 1.5 }}>
        O Coletiv não hospeda estes cursos nem controla o conteúdo ou a
        disponibilidade deles. A oferta de cada instituição pode mudar.
      </p>
    </div>
  )
}
