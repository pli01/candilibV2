import { Router } from 'express'
import adminControllers from './admin/index'
import candidatControllers from './candidat'

const router = new Router()

router.use('/admin', adminControllers)
router.use('/candidat', candidatControllers)

router.get('/', (req, res) => res.json({ ok: true }))

export default router
