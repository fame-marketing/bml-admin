import  {Router} from 'express'
const router = Router();

router.get('/login', function(req, res, next) {
  res.render('login',
    {
      layout: 'login',
      title: 'Fame Admin',
      description: 'Fame Admin'
    });
});

export default router