// middlewares/validateProfile.js
import { validator } from "../utils/validator.js";

export const validateProfile = (req, res, next) => {
  const { full_name, phone, dob, gender } = req.body;

  if (!validator.isValidName(full_name)) {
    return res.status(400).json({ message: "Full name is required" });
  }

  if (!validator.isValidPhone(phone)) {
    return res
      .status(400)
      .json({ message: "Invalid phone number format (must be 9–11 digits)" });
  }

  if (!validator.isValidDate(dob)) {
    return res.status(400).json({ message: "Invalid date format for DOB" });
  }

  if (!validator.isValidGender(gender)) {
    return res.status(400).json({ message: "Invalid gender value" });
  }

  next();
};