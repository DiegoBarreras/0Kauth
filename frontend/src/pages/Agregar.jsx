import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

function Agregar() {
  const [modo, setModo] = useState('manual') // 'manual' o 'qr'
  const [nom_servicio, setNomServicio] = useState('')
  const [nom_cuenta, setNomCuenta] = useState('')
  const [totp_secreto, setTotpSecreto] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      await api.agregarCuenta({ nom_servicio, nom_cuenta, totp_secreto })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor">
      <div className="header">
        <button onClick={() => navigate('/dashboard')} className="btn-secundario">
          ← Volver
        </button>
        <h2>Agregar cuenta</h2>
      </div>

      <div className="tabs">
        <button
          className={modo === 'manual' ? 'tab activo' : 'tab'}
          onClick={() => setModo('manual')}
        >
          Manual
        </button>
        <button
          className={modo === 'qr' ? 'tab activo' : 'tab'}
          onClick={() => setModo('qr')}
        >
          Escanear QR
        </button>
      </div>

      {modo === 'manual' ? (
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="servicio">Servicio</label>
            <input
              id="servicio"
              type="text"
              value={nom_servicio}
              onChange={e => setNomServicio(e.target.value)}
              placeholder="GitHub, Discord..."
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="cuenta">Cuenta</label>
            <input
              id="cuenta"
              type="text"
              value={nom_cuenta}
              onChange={e => setNomCuenta(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="secreto">Clave secreta</label>
            <input
              id="secreto"
              type="text"
              value={totp_secreto}
              onChange={e => setTotpSecreto(e.target.value.toUpperCase())}
              placeholder="JBSWY3DPEHPK3PXP"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar cuenta'}
          </button>
        </form>
      ) : (
        <div className="qr-placeholder">
          <p>Escáner de QR próximamente</p>
        </div>
      )}
    </div>
  )
}

export default Agregar