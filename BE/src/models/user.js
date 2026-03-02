import bcrypt from "bcryptjs";
import { nanoidNumbersOnly } from "../utils/nanoid.js";
import { pool } from "../config/db.js";

export const userModel = {
  /**
   * 🔹 Lấy thông tin một người dùng theo ID
   * @param {string} userId - ID người dùng
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM User WHERE user_id = ?",
      [userId]
    );
    return rows.length ? rows[0] : null;
  },

   async getUserByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);
    return rows[0];
  },

  /**
   * 🔹 Lấy tất cả người dùng (có join role)
   */
  async getAllUsers() {
    const [rows] = await pool.query(
      `SELECT u.*, r.role_name 
       FROM User u 
       LEFT JOIN Role r ON u.role_id = r.role_id`
    );
    return rows;
  },

  /**
   * 🔹 Tạo mới người dùng
   * @param {Object} data - thông tin người dùng
   */
  async createUser(data) {
    const id = nanoidNumbersOnly(12); // ví dụ sinh ID số dài 12 ký tự

  const [result] = await pool.query(
    `INSERT INTO User (user_id, username, password_hash, full_name, email, phone, role_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.username, data.password, data.full_name, data.email, data.phone, data.role_id] // password đã được hash sẵn ở controller
  );

  return { user_id: id, affectedRows: result.affectedRows };
  },

  /**
   * 🔹 Cập nhật thông tin người dùng
   */
  async updateUser(userId, updates) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === "password") {
        const hashed = await bcrypt.hash(value, 10);
        fields.push("password_hash = ?");
        values.push(hashed);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    values.push(userId);

    const [result] = await pool.query(
      `UPDATE User SET ${fields.join(", ")} WHERE user_id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  /**
   * 🔹 Xóa người dùng
   */
  async deleteUser(userId) {
    const [result] = await pool.query(
      "DELETE FROM User WHERE user_id = ?",
      [userId]
    );
    return result.affectedRows > 0;
  },

  async getUserByUsername(username) {
  const [rows] = await pool.query(
    `SELECT u.*, r.role_name
     FROM User u
     LEFT JOIN Role r ON u.role_id = r.role_id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0];
},


  /**
   * 🔹 Kiểm tra đăng nhập
   */
  async checkLogin(username, password) {
    const [rows] = await pool.query(
      "SELECT * FROM User WHERE username = ? AND is_active = TRUE",
      [username]
    );
    if (!rows.length) return null;

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    return isMatch ? user : null;
  },

  async getAllUsersWithProfile() {
  const [rows] = await pool.query(`
    SELECT 
      u.user_id,
      u.username,
      u.full_name,
      u.email,
      u.phone,
      u.role_id,
      r.role_name,
      p.address,
      p.gender,
      p.dob
    FROM User u
    LEFT JOIN Role r ON u.role_id = r.role_id
    LEFT JOIN User_Profile p ON u.user_id = p.user_id
    WHERE u.role_id = 1
  `);
  return rows;
},

async updateUserWithProfile(user_id, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // build update cho User (chỉ cập nhật field có value)
      const userFields = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role_id: data.role_id,
        password_hash: data.password, // nếu bạn lưu tên field khác thì đổi lại
        is_active: data.is_active,
      };

      const entries = Object.entries(userFields).filter(([, v]) => v !== undefined);
      if (entries.length > 0) {
        const cols = entries.map(([k]) => `${k} = ?`).join(", ");
        const vals = entries.map(([, v]) => v);
        await conn.query(`UPDATE User SET ${cols}, updated_at = NOW() WHERE user_id = ?`, [...vals, user_id]);
      }

      // profile
      const { address, dob, gender } = data;
      if (address || dob || gender) {
        const [rows] = await conn.query(`SELECT profile_id FROM User_Profile WHERE user_id = ?`, [user_id]);
        if (rows.length > 0) {
          await conn.query(
            `UPDATE User_Profile SET address = ?, dob = ?, gender = ? WHERE user_id = ?`,
            [address, dob, gender, user_id]
          );
        } else {
          const profile_id = crypto.randomUUID();
          await conn.query(
            `INSERT INTO User_Profile (profile_id, user_id, dob, gender, address) VALUES (?, ?, ?, ?, ?)`,
            [profile_id, user_id, dob, gender, address]
          );
        }
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.error("Error updateUserWithProfile:", err);
      throw err;
    } finally {
      conn.release();
    }
  },

  async searchUsers(keyword) {
  const search = `%${keyword}%`;
  const [rows] = await pool.query(
    `
    SELECT 
      u.user_id,
      u.username,
      u.full_name,
      u.email,
      u.phone,
      u.role_id,
      r.role_name,
      p.address,
      p.gender,
      p.dob
    FROM User u
    LEFT JOIN Role r ON u.role_id = r.role_id
    LEFT JOIN User_Profile p ON u.user_id = p.user_id
    WHERE u.user_id LIKE ? OR u.full_name LIKE ? OR u.username LIKE ?
    `,
    [search, search, search]
  );
  return rows;
},

};