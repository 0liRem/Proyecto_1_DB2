const express = require('express');
const controller = require('../controller/generic.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const { applyTenantScope } = require('../middlewares/tenant.middleware');

router.use(protect);
router.use('/:collection', applyTenantScope);

/* ===========================
   AGGREGATE
=========================== */

router.get('/:collection/aggregate', controller.aggregateDynamic);

/* ===========================
   COLLECTION
=========================== */

router
.route('/:collection')
.get(authorize('read'), controller.getAll)
.post(authorize('create'), controller.createOne);

/* ===========================
   DOCUMENT BY ID
=========================== */

router
.route('/:collection/:id')
.get(authorize('read'), controller.getOne)
.patch(authorize('update'), controller.updateOne)
.delete(authorize('delete'), controller.deleteOne);

module.exports = router;