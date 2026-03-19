import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/usuario.js';

const router = Router();

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    if (password.length < 8)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

    const existente = await UsuarioModel.buscarPorEmail(email);
    if (existente)
      return res.status(409).json({ error: 'El email ya está registrado' });

    const pw_hash = await bcrypt.hash(password, 12);
    const usuario = await UsuarioModel.crear({ email, pw_hash });

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, usuario: { id: usuario.id, email: usuario.email } });
  } catch (err) {
    console.error('registro error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    const usuario = await UsuarioModel.buscarPorEmail(email);
    if (!usuario)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valida = await bcrypt.compare(password, usuario.pw_hash);
    if (!valida)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, usuario: { id: usuario.id, email: usuario.email } });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;