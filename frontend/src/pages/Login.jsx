import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { derivarLlave, generarSalt } from '../utils/crypto'
import { guardarLlave } from '../utils/session'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      const data = await api.login(email, password)
      localStorage.setItem('token', data.token)

      // Deriva la llave AES desde la contraseña
      const salt = email + '_0kauth_salt'
      const llave = await derivarLlave(password, salt)
      guardarLlave(llave)

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor">
      <h1 className="logo">0kauth</h1>
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </div>
  )
}

export default Login