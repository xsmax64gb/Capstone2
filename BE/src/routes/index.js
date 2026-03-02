import { Router } from 'express'
import userRoutes from './user.js'
import profileRoutes from './userProfile.js'
import adminUserRoutes from "./adminUser.js";

const router = Router()

router.use('/users', userRoutes)
router.use("/profile", profileRoutes);//route profile
router.use("/admin/users", adminUserRoutes); // route admin user

export default router
