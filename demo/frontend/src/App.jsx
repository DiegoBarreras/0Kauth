import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import * as snarkjs from 'snarkjs'
import { buildPoseidon } from 'circomlibjs'

const DEMO_BACKEND = 'http://192.168.100.59:3000/api'

async function generarPruebaZK(secreto, challenge) {
  const poseidon = await buildPoseidon()
  const secretoBig = BigInt(secreto)
  const challengeBig = BigInt(challenge)

  const input = {
    secreto: secretoBig.toString(),
    challenge: challengeBig.toString(),
  }

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    '/zk/totp.wasm',
    '/zk/totp_final.zkey'
  )

  return { proof, publicSignals }
}

function App() {
  const [estado, setEstado] = useState('inicio') // inicio, esperando, verificado, error
  const [challengeData, setChallengeData] = useState(null)
  const [qrValue, setQrValue] = useState('')
  const [secreto, setSecreto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  async function iniciarSesion() {
    try {
      setError(null)
      setCargando(true)
      const res = await fetch(`${DEMO_BACKEND}/challenge`)
      const data = await res.json()
      setChallengeData(data)

      const qr = JSON.stringify({
        tipo: '0kauth-challenge',
        id: data.id,
        challenge: data.challenge,
        callback: `${DEMO_BACKEND}/verificar`,
        servicio: 'Demo App'
      })
      setQrValue(qr)
      setEstado('esperando')
    } catch (err) {
      setError('No se pudo conectar al servidor')
    } finally {
      setCargando(false)
    }
  }

  async function verificarManual() {
    if (!secreto || !challengeData) return
    try {
      setError(null)
      setCargando(true)
      const { proof, publicSignals } = await generarPruebaZK(secreto, challengeData.challenge)

      const res = await fetch(`${DEMO_BACKEND}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: challengeData.id, proof, publicSignals })
      })
      const data = await res.json()

      if (data.valido) {
        setEstado('verificado')
      } else {
        setError('Prueba ZK inválida')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a12',
      color: '#e8e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '2rem',
      margin: '0',
    }}>
      {estado === 'inicio' && (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Demo App
          </h1>
          <p style={{ color: '#6b6b8a', marginBottom: '2rem' }}>
            Inicia sesión usando 0kauth con ZK Proofs
          </p>
          <button onClick={iniciarSesion} disabled={cargando} style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%'
          }}>
            {cargando ? 'Generando...' : 'Iniciar sesión con 0kauth'}
          </button>
          {error && <p style={{ color: '#e05577', marginTop: '1rem' }}>{error}</p>}
        </div>
      )}

      {estado === 'esperando' && (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Escanea el QR con 0kauth</h2>
          <p style={{ color: '#6b6b8a', marginBottom: '1.5rem' }}>
            Abre tu autenticador 0kauth y escanea este código
          </p>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1.5rem' }}>
            <QRCodeSVG value={qrValue} size={220} />
          </div>

          <p style={{ color: '#6b6b8a', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ¿No tienes el celular? Prueba manualmente:
          </p>
          <input
            type="text"
            placeholder="Ingresa tu secreto (ej: 12345)"
            value={secreto}
            onChange={e => setSecreto(e.target.value)}
            style={{
              background: '#12121e',
              border: '1px solid #2a2a3d',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#e8e8f0',
              fontSize: '1rem',
              width: '100%',
              marginBottom: '0.75rem',
              outline: 'none'
            }}
          />
          <button onClick={verificarManual} disabled={cargando || !secreto} style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.85rem',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%'
          }}>
            {cargando ? 'Verificando...' : 'Verificar manualmente'}
          </button>
          {error && <p style={{ color: '#e05577', marginTop: '1rem' }}>{error}</p>}
        </div>
      )}

      {estado === 'verificado' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Autenticado con ZK Proofs</h2>
          <p style={{ color: '#6b6b8a', marginBottom: '2rem' }}>
            Tu identidad fue verificada sin revelar ningún secreto
          </p>
          <button onClick={() => { setEstado('inicio'); setChallengeData(null); setSecreto('') }} style={{
            background: 'transparent',
            border: '1px solid #2a2a3d',
            color: '#8888aa',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}>
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  )
}

export default App