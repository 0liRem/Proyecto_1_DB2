exports.restrictTo = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({
        message: 'No tienes permisos para esta acción'
      });
    }

    next();
  };
};