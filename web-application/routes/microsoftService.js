

const express = require('express');
const router = express.Router();
const msAPIController=require('../controller/msAPIController');

module.exports = (passport, Account) => {
  router.get('/create', passport.authenticate('JWT'),msAPIController.GET.createHandler )
  router.get('/list', msAPIController.GET.listHandler);
  router.post('/enroll/:id', passport.authenticate('JWT'), msAPIController.POST.enrollHandler);
  router.post('/verify/:id', msAPIController.POST.verifyHandler);
  return router;
}