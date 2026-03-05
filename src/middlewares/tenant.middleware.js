const { ObjectId } = require('mongodb');

exports.applyTenantScope = (req, res, next) => {

  const user = req.user;
  const collection = req.params.collection;

  const tenantCollections = [
    'ordenes',
    'menu_items',
    'promociones',
    'resenas'
  ];

  if (!tenantCollections.includes(collection)) {
    return next();
  }


  req.tenantFilter = {};

  switch (user.tipo) {

    case 'administrador':
    case 'caja':
      // Solo su restaurante
      if (!user.restauranteId) {
        return res.status(403).json({
          message: 'Usuario sin restaurante asignado'
        });
      }

      req.tenantFilter.restauranteId =
        new ObjectId(user.restauranteId);

      break;

    case 'usuario':
      // Solo sus órdenes
      if (collection === 'ordenes') {
        req.tenantFilter.usuarioId =
          new ObjectId(user._id);
      }
      break;

    case 'repartidor':
      // Solo órdenes asignadas a él
      if (collection === 'ordenes') {
        req.tenantFilter.repartidorId =
          new ObjectId(user._id);
      }
      break;
  }

  next();
};