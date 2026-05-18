import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as snarkjs from 'snarkjs';
import { randomBytes } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

const verificationKey = JSON.parse(
  readFileSync(join(__dirname, 'totp_verification_key.json'), 'utf8')
);

// Almacena challenges activos en memoria
const challenges = new Map();

// GET /api/challenge — genera un challenge nuevo
app.get('/api/challenge', (req, res) => {
  const challenge = BigInt('0x' + randomBytes(16).toString('hex')).toString();
  const id = randomBytes(8).toString('hex');
  
  challenges.set(id, { challenge, usado: false });

  // Expira en 5 minutos
  setTimeout(() => challenges.delete(id), 5 * 60 * 1000);

  return res.json({ id, challenge });
});

// POST /api/verificar — verifica la prueba ZK
app.post('/api/verificar', async (req, res) => {
  try {
    const { id, proof, publicSignals } = req.body;

    if (!id || !proof || !publicSignals)
      return res.status(400).json({ error: 'id, proof y publicSignals son requeridos' });

    const entry = challenges.get(id);
    if (!entry)
      return res.status(404).json({ error: 'Challenge no encontrado o expirado' });

    if (entry.usado)
      return res.status(400).json({ error: 'Challenge ya fue usado' });

    const esValida = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

    if (esValida) {
      entry.usado = true;
    }

    return res.json({ valido: esValida });
  } catch (err) {
    console.error('verificar error:', err);
    return res.status(500).json({ error: 'Error al verificar la prueba' });
  }
});

app.listen(PORT, () => {
  console.log(`Demo backend corriendo en http://localhost:${PORT}`);
});