import { NavLink, Outlet } from 'react-router-dom'
import {
  IconeCasa, IconeGrafico, IconeLivro, IconeMapa, IconePessoas,
} from './Icone.jsx'
import './Layout.css'

// Itens fixos da navegação inferior (as outras telas abrem a partir do dashboard)
const navItens = [
  { to: '/', rotulo: 'Início', Icone: IconeCasa, fim: true },
  { to: '/calculadora', rotulo: 'Valorização', Icone: IconeGrafico },
  { to: '/capacitacao', rotulo: 'Cursos', Icone: IconeLivro },
  { to: '/oportunidades', rotulo: 'Vagas', Icone: IconeMapa },
  { to: '/assembleia', rotulo: 'Comunidade', Icone: IconePessoas },
]

export default function Layout() {
  return (
    <>
      <main>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {navItens.map(({ to, rotulo, Icone, fim }) => (
          <NavLink key={to} to={to} end={fim} className="nav-item">
            <Icone tamanho={22} />
            <span>{rotulo}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
