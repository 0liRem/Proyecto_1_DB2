const express = require('express');
const controller = require('../controller/generic.controller');

const router = express.Router();
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

module.exports = router;