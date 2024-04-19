import  {Router} from 'express'
import * as mapController from '../controllers/map.js'

const mapRouter = Router();

mapRouter.get('/', mapController.render);

mapRouter.post('/', mapController.getEvents);

export default mapRouter;
