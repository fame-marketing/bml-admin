import {Router} from 'express'
import multer from 'multer'

import * as nearbyNowController from '../controllers/nearbyNow.js'
import * as importController from '../controllers/import.js'
import * as webhookController from '../controllers/webhook.js'

const nearbyNowRouter  = Router(),
      fileHandler = multer({storage:multer.memoryStorage()});

nearbyNowRouter.get('/', nearbyNowController.render)
nearbyNowRouter.post('/', nearbyNowController.validatePage)
nearbyNowRouter.get('/service-areas', nearbyNowController.getServiceAreas)
nearbyNowRouter.get('/service-area/:area', nearbyNowController.getServiceAreaDetails)
nearbyNowRouter.get('/import', importController.render)
nearbyNowRouter.post('/import/submit', fileHandler.single('file'), importController.storeData)
nearbyNowRouter.post('/webhook', webhookController.storeEvent)

export default nearbyNowRouter
