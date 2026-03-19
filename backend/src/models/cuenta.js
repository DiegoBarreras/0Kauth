import pool from '../db/pool.js';

export const CuentaModel = {
  async obtenerPorUsuario(usuario_id) {
    const [rows] = await pool.query(
      'SELECT * FROM cuentas_almacenadas WHERE usuario_id = ?',
      [usuario_id]
    );
    return rows;
  },

  async crear({ usuario_id, nom_servicio, nom_cuenta, totp_secreto, totp_algoritmo, totp_digitos, totp_frecuencia }) {
    const [result] = await pool.query(
      `INSERT INTO cuentas_almacenadas 
       (usuario_id, nom_servicio, nom_cuenta, totp_secreto, totp_algoritmo, totp_digitos, totp_frecuencia) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, nom_servicio, nom_cuenta, totp_secreto, totp_algoritmo, totp_digitos, totp_frecuencia]
    );
    return { id: result.insertId, nom_servicio, nom_cuenta };
  },

  async eliminar(id, usuario_id) {
    const [result] = await pool.query(
      'DELETE FROM cuentas_almacenadas WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );
    return result.affectedRows > 0;
  },

  async buscarPorId(id, usuario_id) {
    const [rows] = await pool.query(
      'SELECT * FROM cuentas_almacenadas WHERE id = ? AND usuario_id = ? LIMIT 1',
      [id, usuario_id]
    );
    return rows[0] ?? null;
  },
};