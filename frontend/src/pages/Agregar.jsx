import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { Html5Qrcode } from "html5-qrcode";
import * as OTPAuth from 'otpauth'

function Agregar() {
  const [modo, setModo] = useState('manual') // 'manual' o 'qr'
  const [nom_servicio, setNomServicio] = useState('')
  const [nom_cuenta, setNomCuenta] = useState('')
  const [totp_secreto, setTotpSecreto] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()
  const html5QrCode = useRef(null);

  useEffect(() => {
    if (modo === 'qr') {
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          html5QrCode.current = new Html5Qrcode("reader");
          html5QrCode.current.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              if (decodedText.startsWith('otpauth://')) {
                const postParseCode = OTPAuth.URI.parse(decodedText);
                api.agregarCuenta({
                  nom_servicio: postParseCode.issuer,
                  nom_cuenta: postParseCode.label,
                  totp_secreto: postParseCode.secret.base32,
                  totp_algoritmo: postParseCode.algorithm,
                  totp_digitos: postParseCode.digits,
                  totp_frecuencia: postParseCode.period
                }) .then(() => {
                  html5QrCode.current.stop()
                }) .then(() => {
                  html5QrCode.current = null
                  navigate('/dashboard')
                }) .catch(err => {
                  setError(err.message)
                })
              } else if (decodedText.startsWith('0kauth://')) {
                // LLENAR CON API PROPIETARIA PARA LECTURA DE QRs ZK
              }
            },
            () => {}
          )
          .catch(err => {
            setError('No se pudo acceder al scanner.')
          }) 
        }
      }).catch(err => {
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
      })
    }
    return () => {
      if (html5QrCode.current) {
        html5QrCode.current.stop()
      }
    }
  }, [modo, navigate])

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
        <div id="reader"></div>
      )}
    </div>
  )
}

export default Agregar