import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function testConnection() {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    console.log('Kết nối MySQL thành công!')
  } catch (err) {
    throw err
  }
}

export { pool }
