const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/roles.middleware');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.use(protect);

// Solo administrador o caja
router.get(
  '/ventas',
  restrictTo('administrador', 'caja'),
  reportController.ventasReport
);

module.exports = router;