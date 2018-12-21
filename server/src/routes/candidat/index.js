import { Router } from 'express'

const router = new Router()

router.get('/', (req, res) => res.json({ candidat: true }))

export default router
