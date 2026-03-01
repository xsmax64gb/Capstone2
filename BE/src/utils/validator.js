// utils/validator.js
export const validator = {
  isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isStrongPassword(password) {
    // ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  },

  isPhoneNumber(phone) {
    return /^[0-9]{9,11}$/.test(phone); // số Việt Nam phổ biến 9-11 số
  },

  isValidPhone(phone) {
    const phoneRegex = /^[0-9]{9,11}$/;
    return phoneRegex.test(phone);
  },

  isValidName(name) {
    return typeof name === "string" && name.trim().length > 0;
  },

  isValidDate(dateStr) {
    if (!dateStr) return true; // optional field
    const date = new Date(dateStr);
    const now = new Date();
    if (isNaN(date)) return false; // không phải ngày hợp lệ
    if (date > now) return false; // ngày sinh trong tương lai
    return true;
  },

  isValidGender(gender) {
    const allowed = ["male", "female", "other", ""];
    return allowed.includes((gender || "").toLowerCase());
  },
};