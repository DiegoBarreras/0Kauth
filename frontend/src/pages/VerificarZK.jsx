import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generarPruebaZK } from '../utils/zk'
import { api } from '../utils/api'

function VerificarZK() {
  const [secreto, setSecreto] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleVerificar(e) {
    e.preventDefault()
    setError(null)
    setResultado(null)
    setCargando(true)

    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const { proof, publicSignals } = await generarPruebaZK(secreto, timestamp)
      const data = await api.verificarZK(proof, publicSignals)
      setResultado(data.valido)
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
        <h2>Verificar ZK</h2>
      </div>

      <form onSubmit={handleVerificar}>
        <div className="campo">
          <label htmlFor="secreto">Secreto TOTP</label>
          <input
            id="secreto"
            type="text"
            value={secreto}
            onChange={e => setSecreto(e.target.value)}
            placeholder="12345"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        {resultado !== null && (
          <p className={resultado ? 'exito' : 'error'}>
            {resultado ? '✓ Prueba ZK válida' : '✗ Prueba ZK inválida'}
          </p>
        )}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Generando prueba ZK...' : 'Verificar con ZK'}
        </button>
      </form>
    </div>
  )
}

export default VerificarZK