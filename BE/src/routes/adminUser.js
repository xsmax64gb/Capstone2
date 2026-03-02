import { Router } from "express";
import { adminUserController } from "../controllers/adminUser.js";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Áp dụng middleware kiểm tra token và quyền admin
router.use(authMiddleware.verifyToken, isAdmin);

// CRUD user
router.get("/", adminUserController.getAll);
router.post("/", adminUserController.create);
router.put("/:id", adminUserController.update);
router.delete("/:id", adminUserController.delete);
router.get("/search", adminUserController.search); 

export default router;