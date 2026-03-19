import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'
import * as OTPAuth from 'otpauth'

function calcularCodigo(secreto, algoritmo, digitos, frecuencia) {
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secreto),
      algorithm: algoritmo,
      digits: digitos,
      period: frecuencia,
    })
    return totp.generate()
  } catch {
    return '------'
  }
}

function calcularTiempoRestante(frecuencia) {
  return frecuencia - (Math.floor(Date.now() / 1000) % frecuencia)
}

function TarjetaCuenta({ cuenta, onEliminar }) {
  const [codigo, setCodigo] = useState('')
  const [tiempoRestante, setTiempoRestante] = useState(0)

  useEffect(() => {
    function actualizar() {
      setCodigo(calcularCodigo(
        cuenta.totp_secreto,
        cuenta.totp_algoritmo,
        cuenta.totp_digitos,
        cuenta.totp_frecuencia
      ))
      setTiempoRestante(calcularTiempoRestante(cuenta.totp_frecuencia))
    }

    actualizar()
    const intervalo = setInterval(actualizar, 1000)
    return () => clearInterval(intervalo)
  }, [cuenta])

  const porcentaje = (tiempoRestante / cuenta.totp_frecuencia) * 100
  const urgente = tiempoRestante <= 5

  return (
    <div className="tarjeta-cuenta">
      <div className="cuenta-info">
        <span className="servicio">{cuenta.nom_servicio}</span>
        <span className="cuenta">{cuenta.nom_cuenta}</span>
        <span className={`codigo ${urgente ? 'urgente' : ''}`}>
          {codigo.slice(0, 3)} {codigo.slice(3)}
        </span>
      </div>
      <div className="cuenta-acciones">
        <div className="temporizador">
          <svg viewBox="0 0 36 36" className="circulo-svg">
            <path
              className="circulo-fondo"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`circulo-progreso ${urgente ? 'urgente' : ''}`}
              strokeDasharray={`${porcentaje}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className={`tiempo-texto ${urgente ? 'urgente' : ''}`}>
            {tiempoRestante}
          </span>
        </div>
        <button onClick={() => onEliminar(cuenta.id)} className="btn-eliminar">
          Eliminar
        </button>
      </div>
    </div>
  )
}

function Dashboard() {
  const [cuentas, setCuentas] = useState([])
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    cargarCuentas()
  }, [])

  async function cargarCuentas() {
    try {
      const data = await api.getCuentas()
      setCuentas(data.cuentas)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function eliminarCuenta(id) {
    if (!confirm('¿Seguro que quieres eliminar esta cuenta?')) return
    try {
      await api.eliminarCuenta(id)
      setCuentas(cuentas.filter(c => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (cargando) return <div className="contenedor"><p>Cargando...</p></div>

  return (
    <div className="contenedor">
      <div className="header">
        <h1 className="logo">0kauth</h1>
        <button onClick={cerrarSesion} className="btn-secundario">
          Salir
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <Link to="/agregar" className="btn-agregar">
        + Agregar cuenta
      </Link>

      {cuentas.length === 0 ? (
        <p className="vacio">No tienes cuentas agregadas aún.</p>
      ) : (
        <div className="lista-cuentas">
          {cuentas.map(cuenta => (
            <TarjetaCuenta
              key={cuenta.id}
              cuenta={cuenta}
              onEliminar={eliminarCuenta}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard