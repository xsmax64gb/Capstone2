import { pool } from '../config/db.js'

export async function findAll() {
  const [rows] = await pool.query('SELECT * FROM users LIMIT 100')
  return rows
}
