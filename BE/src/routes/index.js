import { Router } from 'express'
import userRoutes from './user.js'

const router = Router()

router.use('/users', userRoutes)

export default router
