import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import Agregar from './pages/Agregar'
import VerificarZK from './pages/VerificarZK'

function RutaProtegida({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        } />
        <Route path="/agregar" element={
          <RutaProtegida>
            <Agregar />
          </RutaProtegida>
        } />
        <Route path="/verificar-zk" element={
          <RutaProtegida>
            <VerificarZK />
          </RutaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App