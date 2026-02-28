import { Router } from 'express'
import * as userController from '../controllers/userController.js'

const router = Router()

router.get('/', userController.getAll)

export default router
