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
};

exports.getOne = async (req, res) => {
  const db = getDB();
  const { collection, id } = req.params;

  const data = await db.collection(collection)
    .findOne({ _id: new ObjectId(id) });

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