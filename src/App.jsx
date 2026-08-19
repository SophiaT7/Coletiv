// Coletiv — Feito para servir a Deus e aos pequenos empreendedores.
import { Routes, Route, Navigate } from 'react-router-dom'
import { RotaProtegida, RotaLogada, RotaPublica } from './components/RotaProtegida.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RadarDireitos from './pages/RadarDireitos.jsx'
import Calculadora from './pages/Calculadora.jsx'
import Sobrecarga from './pages/Sobrecarga.jsx'
import Capacitacao from './pages/Capacitacao.jsx'
import Oportunidades from './pages/Oportunidades.jsx'
import Relatorios from './pages/Relatorios.jsx'
import Assembleia from './pages/Assembleia.jsx'
import Perfil from './pages/Perfil.jsx'

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route element={<RotaPublica />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Logado, mas ainda sem perfil */}
      <Route element={<RotaLogada />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      {/* Logado e com perfil — app principal */}
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/radar" element={<RadarDireitos />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/sobrecarga" element={<Sobrecarga />} />
          <Route path="/capacitacao" element={<Capacitacao />} />
          <Route path="/oportunidades" element={<Oportunidades />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/assembleia" element={<Assembleia />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      {/* Qualquer endereço desconhecido volta para o início. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
