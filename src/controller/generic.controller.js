const { getDB } = require('../../CrDB');
const APIFeatures = require('../utils/APIFeatures');
const { ObjectId } = require('mongodb');

exports.createOne = async (req, res) => {
  const db = getDB();
  const { collection } = req.params;

  const result = await db.collection(collection).insertOne(req.body);

  res.status(201).json({
    status: 'success',
    data: result
  });

  if (collection === 'restaurantes' && req.user.tipo !== 'administrador') {
  return res.status(403).json({
    message: 'Solo administrador puede crear restaurantes'
  });
  }

  if (collection === 'menu_items' && req.user.tipo === 'usuario') {
    return res.status(403).json({
      message: 'No tienes permisos para crear inventario'
    });
  }
  if (req.tenantFilter) {
  req.body.restauranteId = req.user.restauranteId;
}

if (req.user.tipo === 'administrador' || req.user.tipo === 'caja') {
  if (req.user.restauranteId) {
    req.body.restauranteId = req.user.restauranteId;
  }
}

// Cliente creando orden
if (req.user.tipo === 'usuario' && collection === 'ordenes') {
  req.body.usuarioId = req.user._id;
}
};

exports.getAll = async (req, res) => {
  const db = getDB();
  const { collection } = req.params;

  const features = new APIFeatures(
    db.collection(collection),
    req.query
  )
    .filter()
    .search()
    .sort()
    .paginate()
    .build();

  const data = await db.collection(collection)
    .find(features.filter, features.options)
    .toArray();

  res.status(200).json({
    status: 'success',
    results: data.length,
    data
  });

    if (req.user.tipo !== 'administrador') {

    if (collection === 'ordenes') {
      features.mongoQuery.restauranteId = req.user.restauranteId;
    }

    if (collection === 'menu_items') {
      features.mongoQuery.restauranteId = req.user.restauranteId;
    }
  }

  if (collection === 'ordenes' && req.user.tipo === 'usuario') {
  features.mongoQuery.usuarioId = req.user._id;
}
if (req.user.tipo !== 'administrador') {

  if (req.user.restauranteId) {
    features.mongoQuery.restauranteId = req.user.restauranteId;
  }

  if (req.user.tipo === 'usuario') {
    features.mongoQuery.usuarioId = req.user._id;
  }
}
if (req.tenantFilter) {
  features.mongoQuery = {
    ...features.mongoQuery,
    ...req.tenantFilter
  };
}

};

exports.getOne = async (req, res) => {
  const db = getDB();
  const { collection, id } = req.params;

  const data = await db.collection(collection)
    .findOne({
      _id: new ObjectId(id),
      ...(req.tenantFilter || {})
    });
  res.status(200).json({
    status: 'success',
    data
  });
  
};

exports.updateOne = async (req, res) => {
  const db = getDB();
  const { collection, id } = req.params;

  const result = await db.collection(collection).updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );

  if (req.user.tipo === 'repartidor') {

  const allowedFields = ['estado'];

  const updates = Object.keys(req.body);

  const valid = updates.every(f =>
    allowedFields.includes(f)
  );

  
  if (!valid) {
    return res.status(403).json({
      message: 'Solo puedes actualizar el estado'
    });
  }
}
  res.status(200).json({
    status: 'success',
    data: result
  });
};

exports.deleteOne = async (req, res) => {
  const db = getDB();
  const { collection, id } = req.params;

  await db.collection(collection).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        eliminado: true,
        fechaEliminacion: new Date()
      }
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Soft delete aplicado'
  });
};

exports.restoreOne = async (req, res) => {
  const db = getDB();
  const { collection, id } = req.params;

  await db.collection(collection).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: { eliminado: false },
      $unset: { fechaEliminacion: "" }
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Documento restaurado'
  });
};

exports.aggregateDynamic = async (req, res) => {
  const db = getDB();
  const { collection } = req.params;

  const { groupBy, sum, avg, count, sort, limit } = req.query;

  const pipeline = [];

  // Soft delete filter
  pipeline.push({
    $match: { eliminado: { $ne: true } }
  });

  if (groupBy) {
    const groupStage = {
      _id: `$${groupBy}`
    };

    if (sum) {
      groupStage.total = { $sum: `$${sum}` };
    }

    if (avg) {
      groupStage.promedio = { $avg: `$${avg}` };
    }

    if (count === 'true') {
      groupStage.conteo = { $sum: 1 };
    }

    pipeline.push({ $group: groupStage });
  }

  if (sort) {
    const sortField = sort.startsWith('-')
      ? { [sort.substring(1)]: -1 }
      : { [sort]: 1 };

    pipeline.push({ $sort: sortField });
  }

  if (limit) {
    pipeline.push({ $limit: parseInt(limit) });
  }

  const data = await db.collection(collection)
    .aggregate(pipeline)
    .toArray();

  res.status(200).json({
    status: 'success',
    pipeline,
    results: data.length,
    data
  });
};