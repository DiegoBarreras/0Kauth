import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { generarPruebaZK } from '../utils/zk'
import { descifrarSecreto } from '../utils/crypto'
import { obtenerLlave } from '../utils/session'
import { api } from '../utils/api'

function VerificarZK() {
  const [cuentas, setCuentas] = useState([])
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoCuentas, setCargandoCuentas] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const challengeData = location.state

  useEffect(() => {
    cargarCuentas()
  }, [])

  async function cargarCuentas() {
    try {
      const llave = obtenerLlave()
      if (!llave) { setError('Sesión expirada'); return }

      const data = await api.getCuentas()

      const cuentasDescifradas = await Promise.all(
        data.cuentas.map(async (cuenta) => {
          const secretoDescifrado = await descifrarSecreto(
            cuenta.totp_secreto,
            cuenta.iv,
            llave
          )
          return { ...cuenta, totp_secreto: secretoDescifrado }
        })
      )

      setCuentas(cuentasDescifradas)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargandoCuentas(false)
    }
  }

  async function handleVerificar(cuenta) {
    setError(null)
    setResultado(null)
    setCargando(true)

    try {
      const { proof, publicSignals } = await generarPruebaZK(
        cuenta.totp_secreto,
        challengeData.challenge
      )
      
      console.log('challenge:', challengeData.challenge)
      console.log('publicSignals:', publicSignals)
      console.log('proof:', proof)

      const res = await fetch(challengeData.callback, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challengeData.id,
          proof,
          publicSignals
        })
      })

      const data = await res.json()
      setResultado(data.valido)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (cargandoCuentas) return <div className="contenedor"><p>Cargando cuentas...</p></div>

  return (
    <div className="contenedor">
      <div className="header">
        <button onClick={() => navigate('/dashboard')} className="btn-secundario">
          ← Volver
        </button>
        <h2>{challengeData ? `Verificar en ${challengeData.servicio}` : 'Verificar ZK'}</h2>
      </div>

      {challengeData && (
        <p style={{ color: '#8888aa', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Selecciona la cuenta con la que quieres verificarte
        </p>
      )}

      {resultado !== null ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {resultado ? '✓' : '✗'}
          </div>
          <p className={resultado ? 'exito' : 'error'}>
            {resultado ? 'Identidad verificada con ZK Proofs' : 'Prueba ZK inválida'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secundario"
            style={{ marginTop: '1.5rem' }}
          >
            Volver al dashboard
          </button>
        </div>
      ) : (
        <div className="lista-cuentas" style={{ marginTop: '0.5rem' }}>
          {cuentas.map(cuenta => (
            <div
              key={cuenta.id}
              className="tarjeta-cuenta"
              onClick={() => {
                if (!cargando) {
                  setCuentaSeleccionada(cuenta)
                  handleVerificar(cuenta)
                }
              }}
              style={{ cursor: cargando ? 'not-allowed' : 'pointer' }}
            >
              <div className="cuenta-info">
                <span className="servicio">{cuenta.nom_servicio}</span>
                <span className="cuenta">{cuenta.nom_cuenta}</span>
              </div>
              {cargando && cuentaSeleccionada?.id === cuenta.id ? (
                <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Generando...</span>
              ) : (
                <span style={{ color: '#6b6b8a', fontSize: '0.85rem' }}>→</span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default VerificarZK