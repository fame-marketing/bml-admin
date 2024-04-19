import {Router} from "express"
import { render } from '../controllers/index.js'

const router  = Router()

router.get('/', render)

export default router
