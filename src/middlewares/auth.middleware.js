const jwt = require('jsonwebtoken');
const { getDB } = require('../../CrDB');
const { ObjectId } = require('mongodb');

exports.protect = async (req, res, next) => {

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getDB();

    const user = await db.collection('usuarios')
      .findOne({ _id: new ObjectId(decoded.id) });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};