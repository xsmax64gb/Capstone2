// middlewares/validateUser.js
import { validator } from "../utils/validator.js";

export const validateRegister = (req, res, next) => {
  const { username, password, email, phone, verify_code } = req.body || {};

  if (!username || !password || !email || !verify_code) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt",
    });
  }

  if (phone && !validator.isPhoneNumber(phone)) {
    return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
  }

  next(); // hợp lệ -> cho qua controller
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập username và password" });
  }

  next();
};

// Validate only email for OTP sending
export const validateEmailForOtp = (req, res, next) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: "Thiếu email" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }
  next();
};

export const validateResetPassword = (req, res, next) => {
  // debug: log body to understand if it's really empty or malformed
  console.log('validateResetPassword body =', req.body);
  if (!req.body || Object.keys(req.body).length === 0) {
    console.warn('validateResetPassword received empty body, headers=', req.headers);
    return res.status(400).json({ message: 'Thiếu thông tin cần thiết (body rỗng hoặc không đúng Content-Type)' });
  }

  const { email, password, verify_code } = req.body;
  if (!email || !password || !verify_code) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt",
    });
  }
  next();
};