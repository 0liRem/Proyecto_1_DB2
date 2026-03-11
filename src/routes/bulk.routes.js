const express = require('express');
const router = express.Router();

const bulkController = require('../controller/bulk.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Bulk menu
router.post('/menu-items', bulkController.bulkCreateMenu);
router.patch('/menu-items', bulkController.bulkUpdateMenu);

// Bulk restaurantes
router.post('/restaurantes', bulkController.bulkCreateRestaurantes);

module.exports = router;