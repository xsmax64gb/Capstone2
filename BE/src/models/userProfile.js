import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";



export const profileModel = {
  async getUserProfile(userId) {

    const [rows] = await pool.query(

      `

      SELECT 

        u.user_id, u.username, u.full_name, u.email, u.phone,

        p.dob, p.gender, p.address

      FROM User u

      LEFT JOIN User_Profile p ON u.user_id = p.user_id

      WHERE u.user_id = ?

      `,

      [userId]

    );

    return rows[0];

  },



  async updateUserProfile(userId, { full_name, phone, dob, gender, address, email }) {
    const conn = await pool.getConnection();

    try {

      await conn.beginTransaction();



      // cập nhật bảng User

      await conn.query(
        `UPDATE User SET full_name = ?, phone = ?, email = COALESCE(?, email) WHERE user_id = ?`,
        [full_name, phone, email || null, userId]
      );


      // kiểm tra đã có profile chưa

      const [existing] = await conn.query(

        `SELECT profile_id FROM User_Profile WHERE user_id = ?`,

        [userId]

      );



      if (existing.length > 0) {

        // cập nhật nếu đã có

        await conn.query(

          `UPDATE User_Profile SET dob = ?, gender = ?, address = ? WHERE user_id = ?`,

          [dob || null, (gender || null), (address || null), userId]

        );

      } else {

        // thêm mới nếu chưa có

        const [idResult] = await conn.query(`SELECT UUID() AS id`);

        const profileId = idResult[0].id;

        await conn.query(

          `INSERT INTO User_Profile (profile_id, user_id, dob, gender, address)

           VALUES (?, ?, ?, ?, ?)`,

          [profileId, userId, (dob || null), (gender || null), (address || null)]

        );

      }



      await conn.commit();

      return true;

    } catch (error) {

      await conn.rollback();

      console.error("Update profile failed:", error);

      return false;

    } finally {

      conn.release();

    }

  },

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const [rows] = await pool.query(
        "SELECT password_hash FROM User WHERE user_id = ?",
        [userId]
      );

      if (!rows.length) {
        return { success: false, message: "User not found" };
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return { success: false, message: "Mật khẩu cũ không đúng" };
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE User SET password_hash = ?, updated_at = NOW() WHERE user_id = ?",
        [newHash, userId]
      );

      return { success: true };
    } catch (error) {
      console.error("Error changePassword:", error);
      return { success: false, message: "Internal error" };
    }
  },

};