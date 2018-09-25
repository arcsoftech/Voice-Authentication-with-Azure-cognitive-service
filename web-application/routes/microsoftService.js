const express = require('express');
const router = express.Router();

module.exports = (passport, Account) => {
  const msAPIController = require('../controller/msAPIController')(Account);
  router.get('/create', passport.authenticate('JWT'), msAPIController.GET.createHandler)
  router.get('/list', msAPIController.GET.listHandler);
  router.post('/enroll/:id', passport.authenticate('JWT'), msAPIController.POST.enrollHandler);
  router.post('/verify/:id', msAPIController.POST.verifyHandler);
  return router;
}