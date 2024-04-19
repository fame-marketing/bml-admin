import  {Router} from 'express'
import * as formsController from '../controllers/forms.js'

const formsRouter = Router();

formsRouter.get('/', formsController.render);

formsRouter.post('/refresh-form-list', formsController.getEvents);

export default formsRouter
