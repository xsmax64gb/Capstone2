import { profileModel } from "../models/userProfile.js";
import responseHandler from "../utils/response.js";
import { validator } from "../utils/validator.js"; // import validator

export const profileController = {
  async getProfile(req, res) {
    try {
      const userId = req.user.user_id;
      const user = await profileModel.getUserProfile(userId);
      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }
      return responseHandler.success(res, "Profile fetched successfully", user);
    } catch (err) {
      console.error(err);
      return responseHandler.internalServerError(res, "Internal server error");
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.user_id;
      let { full_name, phone, dob, gender, address, email } = req.body;

      // Normalize DOB: accept dd-mm-yyyy or dd/mm/yyyy and convert to yyyy-mm-dd
      if (typeof dob === 'string') {
        const m = dob.match(/^(\d{2})[-\/.](\d{2})[-\/.](\d{4})$/);
        if (m) {
          const [_, dd, mm, yyyy] = m;
          dob = `${yyyy}-${mm}-${dd}`; // yyyy-mm-dd
        }
      }

      // ✅ Validate input
      if (!validator.isValidName(full_name)) {
        return responseHandler.badRequest(res, "Full name is required");
      }

      if (!validator.isValidPhone(phone)) {
        return responseHandler.badRequest(res, "Invalid phone number format (must be 9–11 digits)");
      }

      if (!validator.isValidDate(dob)) {
        return responseHandler.badRequest(res, "Invalid date format for DOB or DOB is in the future");
      }

      if (!validator.isValidGender(gender)) {
        return responseHandler.badRequest(res, "Invalid gender value");
      }

      if (email && !validator.isEmail(email)) {
        return responseHandler.badRequest(res, "Invalid email format");
      }

      // ✅ Update model
      const updated = await profileModel.updateUserProfile(userId, {
        full_name,
        phone,
        dob,
        gender,
        address,
        email,
      });

      if (!updated) {
        return responseHandler.badRequest(res, "Update failed");
      }

      return responseHandler.success(res, "Profile updated successfully");
    } catch (err) {
      console.error(err);
      return responseHandler.internalServerError(res, "Internal server error");
    }
  },

  async changePassword(req, res) {
    try {
      const userId = req.user.user_id;
      const { old_password, new_password, confirm_password } = req.body;

      // ✅ Kiểm tra dữ liệu đầu vào
      if (!old_password || !new_password || !confirm_password) {
        return responseHandler.badRequest(res, "Thiếu thông tin mật khẩu");
      }

      // ✅ Validate mật khẩu mới
      if (!validator.isStrongPassword(new_password)) {
        return responseHandler.badRequest(res, "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt");
      }

      // ✅ Validate confirm password
      if (!validator.isStrongPassword(confirm_password)) {
        return responseHandler.badRequest(res, "Xác nhận mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt");
      }

      if (new_password !== confirm_password) {
        return responseHandler.badRequest(res, "Xác nhận mật khẩu không khớp");
      }

      const result = await profileModel.changePassword(userId, old_password, new_password);

      if (!result.success) {
        return responseHandler.badRequest(res, result.message || "Đổi mật khẩu thất bại");
      }

      return responseHandler.success(res, "Đổi mật khẩu thành công");
    } catch (err) {
      console.error("Error changePassword:", err);
      return responseHandler.internalServerError(res, "Lỗi hệ thống khi đổi mật khẩu");
    }
  },
  async getStats(req, res) {
    try {
      const userId = req.user.user_id;
      const stats = await profileModel.getDashboardStats(userId);
      return responseHandler.success(res, "Dashboard stats fetched", stats);
    } catch (err) {
      console.error("Error getStats:", err);
      return responseHandler.internalServerError(res, "Internal server error");
    }
  }
};