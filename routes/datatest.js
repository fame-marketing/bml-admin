import  {Router} from 'express'
import * as dataTestController from '../controllers/datatest.js'

const dataTestRouter = Router();

dataTestRouter.get('/', dataTestController.render);

export default dataTestRouter
