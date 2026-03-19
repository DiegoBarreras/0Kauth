import { Router } from 'express';
import { CuentaModel } from '../models/cuenta.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/cuentas
router.get('/', requireAuth, async (req, res) => {
  try {
    const cuentas = await CuentaModel.obtenerPorUsuario(req.user.sub);
    return res.json({ cuentas });
  } catch (err) {
    console.error('cuentas/get error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/cuentas
router.post('/', requireAuth, async (req, res) => {
  try {
    const { nom_servicio, nom_cuenta, totp_secreto, totp_algoritmo, totp_digitos, totp_frecuencia } = req.body;

    if (!nom_servicio || !nom_cuenta || !totp_secreto)
      return res.status(400).json({ error: 'nom_servicio, nom_cuenta y totp_secreto son requeridos' });

    const cuenta = await CuentaModel.crear({
      usuario_id: req.user.sub,
      nom_servicio,
      nom_cuenta,
      totp_secreto,
      totp_algoritmo: totp_algoritmo ?? 'SHA1',
      totp_digitos:   totp_digitos   ?? 6,
      totp_frecuencia: totp_frecuencia ?? 30,
    });

    return res.status(201).json({ cuenta });
  } catch (err) {
    console.error('cuentas/post error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/cuentas/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const eliminada = await CuentaModel.eliminar(req.params.id, req.user.sub);

    if (!eliminada)
      return res.status(404).json({ error: 'Cuenta no encontrada' });

    return res.json({ mensaje: 'Cuenta eliminada correctamente' });
  } catch (err) {
    console.error('cuentas/delete error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;