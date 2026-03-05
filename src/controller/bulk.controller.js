const { getDB } = require('../../CrDB');

exports.bulkCreateRestaurantes = async (req, res) => {
  const db = getDB();

  if (req.user.tipo !== 'administrador') {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const { data } = req.body;

  const restaurantes = data.map(r => ({
    ...r,
    fechaRegistro: new Date(),
    activo: true
  }));

  const result = await db.collection('restaurantes')
    .insertMany(restaurantes);

  res.status(201).json({
    inserted: result.insertedCount
  });
};

const { ObjectId } = require('mongodb');

exports.bulkUpdateMenu = async (req, res) => {
  const db = getDB();

  const { updates } = req.body;

  if (!['administrador', 'caja'].includes(req.user.tipo)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const operations = updates.map(u => ({
    updateOne: {
      filter: {
        _id: new ObjectId(u.filter._id),
        restauranteId: req.user.restauranteId
      },
      update: { $set: u.update }
    }
  }));

  const result = await db.collection('menu_items')
    .bulkWrite(operations);

  res.json(result);
};