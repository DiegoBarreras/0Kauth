import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as snarkjs from 'snarkjs';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

const verificationKey = JSON.parse(
  readFileSync(join(__dirname, '../zk/totp_verification_key.json'), 'utf8')
);

// POST /api/zk/verificar
router.post('/verificar', requireAuth, async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;

    if (!proof || !publicSignals)
      return res.status(400).json({ error: 'proof y publicSignals son requeridos' });

    const esValida = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

    return res.json({ valido: esValida });
  } catch (err) {
    console.error('zk/verificar error:', err);
    return res.status(500).json({ error: 'Error al verificar la prueba' });
  }
});

export default router;