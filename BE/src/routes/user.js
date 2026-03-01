import { Router } from "express";
import { userController } from "../controllers/user.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateRegister, validateLogin, validateEmailForOtp, validateResetPassword } from "../middlewares/validateUser.js";

const router = Router();


router.get("/", authMiddleware.verifyToken, userController.getAllUsers);
router.get("/me", authMiddleware.verifyToken, userController.getUserByToken);
router.post("/send-verify-code", validateEmailForOtp, userController.sendVerifyCode);
// gửi mã OTP để đặt lại mật khẩu
router.post("/send-reset-code", validateEmailForOtp, userController.sendResetCode);
router.post("/register", validateRegister, userController.register);
// endpoint hồi mật khẩu
router.post("/reset-password", validateResetPassword, userController.resetPassword);
router.get("/:id", authMiddleware.verifyToken, userController.getUserById);
router.put("/:id", authMiddleware.verifyToken, userController.updateUser);
router.delete("/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUser);
router.post("/login", validateLogin, userController.login);

export default router;