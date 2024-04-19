import  {Router} from 'express'
import * as settingsController from '../controllers/settings.js'

const settingsRouter = Router();

settingsRouter.get('/', settingsController.render);

settingsRouter.post('/update-pages', settingsController.updatePages);

export default settingsRouter;