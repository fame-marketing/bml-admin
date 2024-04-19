import {Router} from "express"
import indexRouter from './indexRouter.js'
import nearbyNowRouter from './nearbyNow.js'
import formsRouter from './forms.js'
import dataTestRouter from './datatest.js'
import mapRouter from './map.js'
import settingsRouter from './settings.js'

const router = Router()

router.use('/', indexRouter)
router.use('/nearby-now', nearbyNowRouter);
router.use('/forms', formsRouter);
router.use('/dataTest', dataTestRouter);
router.use('/map', mapRouter);
router.use('/settings', settingsRouter);

export default router
