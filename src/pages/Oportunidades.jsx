import Cabecalho from '../components/Cabecalho.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { linksDeEmprego } from '../data/sitesEmprego.js'

// Mapa de Oportunidades — uma porta de entrada para os portais de emprego,
// com a busca já preenchida com o cargo e a cidade do perfil.
//
// O app não hospeda nem ranqueia vagas: em cidade pequena a amostra é fina
// demais para um "match" significar alguma coisa, e uma lista curta passa a
// impressão errada de que não existe vaga na região. Mandar a pessoa para a
// busca certa nos portais grandes ajuda mais do que ordenar meia dúzia de
// anúncios por afinidade.
export default function Oportunidades() {
  const { profile } = useAuth()
  const links = linksDeEmprego(profile)
  const cargo = (profile?.cargo ?? '').trim()
  const cidade = (profile?.cidade ?? '').trim()

  return (
    <div className="tela">
      <Cabecalho titulo="Mapa de Oportunidades" />

      <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 4, lineHeight: 1.5 }}>
        Os principais sites de vagas do país, em um lugar só.
      </p>
      <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 14, lineHeight: 1.5 }}>
        {cargo
          ? <>A busca já abre preenchida com <strong>{cargo}</strong>{cidade ? <> em <strong>{cidade}</strong></> : null}.</>
          : 'Preencha seu cargo no Perfil para os links já abrirem com a busca pronta.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map((site) => (
          <a key={site.id} className="card" href={site.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <strong style={{ fontSize: 15 }}>{site.nome}</strong>
              <span className={`badge ${site.pago ? 'alerta' : 'ok'}`} style={{ flexShrink: 0 }}>
                {site.selo}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 6, lineHeight: 1.5 }}>
              {site.descricao}
            </p>
            <p style={{ fontSize: 13, color: 'var(--azul)', fontWeight: 600, marginTop: 10 }}>
              Buscar vagas ↗
            </p>
          </a>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 16, lineHeight: 1.5 }}>
        Os links levam para sites de terceiros. O Coletiv não tem relação com
        eles e nunca pede pagamento por uma vaga — desconfie de quem pedir.
      </p>
    </div>
  )
}
