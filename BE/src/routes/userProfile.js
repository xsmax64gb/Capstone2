import { Router } from "express";
import { profileController } from "../controllers/userProfile.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateProfile } from "../middlewares/validateProfile.js"; 

const router = Router();

router.get("/", authMiddleware.verifyToken, profileController.getProfile);
router.put("/", authMiddleware.verifyToken, profileController.updateProfile);
router.put("/change-password", authMiddleware.verifyToken, profileController.changePassword);

export default router;