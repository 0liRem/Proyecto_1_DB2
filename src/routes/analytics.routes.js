const express = require('express');
const analytics = require('../controller/analytics.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/top-productos', analytics.topProductosVendidos);
router.get('/ventas-restaurantes', analytics.ventasPorRestaurante);
router.get('/segmentacion-clientes', analytics.segmentacionClientes);
router.get('/rating-restaurantes', analytics.ratingRestaurantes);
router.get('/ordenes-estado', analytics.ordenesPorEstado);
router.get('/ventas-dia', analytics.ventasPorDia);
router.get('/top-restaurantes', analytics.topRestaurantes);
router.get('/restaurantes-cercanos', analytics.restaurantesCercanos);

module.exports = router;