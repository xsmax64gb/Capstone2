import bcrypt from "bcrypt";
import { userModel } from "../models/user.js";
import { validator } from "../utils/validator.js"; // import validator

export const adminUserController = {
  // 📋 Lấy danh sách tất cả người dùng
  async getAll(req, res) {
    try {
      const users = await userModel.getAllUsersWithProfile();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error getAll:", error);
      res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng." });
    }
  },

    // 🔍 Tìm kiếm người dùng theo tên hoặc ID
  async search(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim() === "") {
        return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm." });
      }

      const users = await userModel.searchUsers(q.trim());
      if (!users.length) {
        return res.status(404).json({ message: "Không tìm thấy người dùng phù hợp." });
      }

      res.status(200).json(users);
    } catch (error) {
      console.error("Error search user:", error);
      res.status(500).json({ message: "Lỗi khi tìm kiếm người dùng." });
    }
  },

  // ➕ Thêm người dùng mới
  async create(req, res) {
    try {
      const { username, password, full_name, email, phone, role_id } = req.body;

      // ✅ Validate cơ bản
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email không hợp lệ." });
      }

      if (!validator.isStrongPassword(password)) {
        return res.status(400).json({
          message:
            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.",
        });
      }

      if (phone && !validator.isValidPhone(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
      }

      // 🚨 Kiểm tra username hoặc email đã tồn tại chưa
      const existingUser = await userModel.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username đã tồn tại." });
      }

      const existingEmail = await userModel.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email đã được sử dụng." });
      }

      // ✅ Nếu qua hết → tạo mới
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        username,
        password: hashedPassword,
        full_name,
        email,
        phone,
        role_id: role_id || 1,
      };

      const user = await userModel.createUser(newUser);
      res.status(201).json({ message: "Tạo người dùng thành công.", user });
    } catch (error) {
      console.error("Error create user:", error);
      res.status(500).json({ message: "Lỗi khi tạo người dùng." });
    }
  },

  // ✏️ Cập nhật thông tin hoặc vai trò/mật khẩu
   async update(req, res) {
    try {
      const { id } = req.params;
      const {
        password,
        role_id,
        email,
        phone,
        full_name,
        is_active,
        // any other fields will be collected in rest
        ...rest
      } = req.body;

      // prevent admin from modifying personal/profile fields
      const forbidden = ["address", "dob", "gender", "email", "phone", "full_name"];
      for (const field of forbidden) {
        if (field in req.body) {
          // if the value is the same as existing this could be allowed, but safer to reject
          return res.status(403).json({ message: "Admin không được sửa thông tin cá nhân của user." });
        }
      }

      // ✅ Validate
      // only validate fields that may still be present (password, role, is_active)
      if (password && !validator.isStrongPassword(password)) {
        return res.status(400).json({
          message:
            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.",
        });
      }

      if (typeof is_active !== 'undefined' && typeof is_active !== 'boolean') {
        return res.status(400).json({ message: "Trạng thái is_active phải là boolean." });
      }

      // admin không thể đổi email nên bỏ kiểm tra này

      // ✅ Chuẩn hoá data: only include permitted fields
      // model.updateUser will hash the password itself, so pass raw value
      const data = { ...rest };
      if (password) data.password = password;
      if (role_id) data.role_id = role_id;
      if (typeof is_active !== 'undefined') data.is_active = is_active;

      // ✅ Cập nhật
      // only update using userModel, no profile fields since admin isn't allowed to change them
      const updatedUser = await userModel.updateUser(id, data);
      if (!updatedUser)
        return res
          .status(404)
          .json({ message: "Không tìm thấy người dùng." });

      return res
        .status(200)
        .json({ message: "Cập nhật người dùng thành công." });
    } catch (error) {
      console.error("Error update user:", error?.stack || error);
      return res.status(500).json({ message: "Lỗi khi cập nhật người dùng." });
    }
  },

  // ❌ Xóa người dùng
  async delete(req, res) {
    try {
      const { id } = req.params;
      await userModel.deleteUser(id);
      res.json({ message: "Xóa người dùng thành công." });
    } catch (error) {
      console.error("Error delete user:", error);
      res.status(500).json({ message: "Lỗi khi xóa người dùng." });
    }
  },
};