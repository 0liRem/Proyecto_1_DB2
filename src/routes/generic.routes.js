const express = require('express');
const controller = require('../controller/generic.controller');

const router = express.Router();

//Proteccion
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/roles.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
router.use(protect);
router.get('/:collection/aggregate', controller.aggregateDynamic);
router
  .route('/:collection')
  .get(controller.getAll)
  .post(controller.createOne);

router
  .route('/:collection/:id')
  .get(controller.getOne)
  .patch(controller.updateOne)
  .delete(controller.deleteOne);

router
  .route('/:collection')
  .get(authorize('read'), controller.getAll)
  .post(authorize('create'), controller.createOne);

router
  .route('/:collection/:id')
  .get(authorize('read'), controller.getOne)
  .patch(authorize('update'), controller.updateOne)
  .delete(authorize('delete'), controller.deleteOne);


  //Tenant  
const { applyTenantScope } = require('../middlewares/tenant.middleware');
router.use(protect);
router.use(applyTenantScope);
  
module.exports = router;