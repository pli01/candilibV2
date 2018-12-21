import { Router } from 'express'

const router = new Router()

router.get('/', (req, res) => res.json({ backoffice: true }))

export default router
