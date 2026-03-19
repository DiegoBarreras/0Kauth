import pool from '../db/pool.js';

export const UsuarioModel = {
  async buscarPorEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] ?? null;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT id, email, created_at FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  },

  async crear({ email, pw_hash }) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, pw_hash) VALUES (?, ?)',
      [email, pw_hash]
    );
    return { id: result.insertId, email };
  },
};