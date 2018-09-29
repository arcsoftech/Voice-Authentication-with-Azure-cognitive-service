var express = require('express');
var router = express.Router();
const conditional = require('express-conditional-middleware');
const indexController = require('../controller/indexController');

/**
 * Check the type of signin post i.e whether it with password or audio.
 * @param {Object} req Request Object
 */

const requestHandler = (req) => {
  if (req.params.type) {
    console.log('requestHandler output', true);
    return true;
  } else {
    console.log('requestHandler output', false);
    return false;
  }
}

module.exports = passport => {

  /* GET*/

  router.get('/', indexController.GET.indexHandler);
  router.get('/signin', indexController.GET.signinHandler);
  router.get('/signup', indexController.GET.signupHandler);
  router.get('/dashboard', passport.authenticate('JWT', {
    failureRedirect: 'signin',
    failureFlash: true,
    session: false
  }), indexController.GET.dashboardHandler);
  router.get('/logout', indexController.GET.logoutHandler);

  /* POST*/

  router.post('/signin/:type?',
    [conditional(
      requestHandler,
      passport.authenticate('local-signin', {
        failureRedirect: 'signin',
        failureFlash: true
      }),
      passport.authenticate('pre-signin', {
        failureRedirect: 'signin',
        failureFlash: true
      })

    )], indexController.POST.signinHandler);
  router.post('/signup', passport.authenticate('local-signup', {
    failureFlash: true,
    failureRedirect: 'signup'
  }), indexController.POST.signupHandler);

  return router;
}