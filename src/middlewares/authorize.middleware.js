const rolesPermissions = require('../config/roles.config');

exports.authorize = (action) => {
  return (req, res, next) => {

    const role = req.user.tipo;
    const collection = req.params.collection;

    const permissions = rolesPermissions[role];

    if (!permissions) {
      return res.status(403).json({
        message: 'Rol no válido'
      });
    }

    const allowedActions = permissions[collection];

    if (!allowedActions || !allowedActions.includes(action)) {
      return res.status(403).json({
        message: 'No tienes permiso para esta acción'
      });
    }

    next();
  };
};