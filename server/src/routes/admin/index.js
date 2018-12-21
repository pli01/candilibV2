import { Router } from 'express'
import loginAdmin from './login'
import backoffice from './backoffice'

const router = new Router()

router.post('/login', loginAdmin)
router.use('/auth', backoffice)

export default router
