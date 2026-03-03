const { getDB } = require('../../CrDB');
const { ObjectId } = require('mongodb');

function initOrderWatcher(io) {
  const db = getDB();

  const changeStream = db.collection('ordenes').watch([], {
    fullDocument: 'updateLookup'
  });

  console.log("hange Stream de órdenes activo");

  changeStream.on('change', (change) => {

    const fullDoc = change.fullDocument;

    if (!fullDoc) return;

    const restauranteRoom = `restaurante_${fullDoc.restauranteId}`;

    switch (change.operationType) {

      case 'insert':
        io.to(restauranteRoom).emit('orden:nueva', fullDoc);
        break;

      case 'update':
        io.to(restauranteRoom).emit('orden:actualizada', fullDoc);
        break;

      case 'delete':
        io.to(restauranteRoom).emit('orden:eliminada', change.documentKey);
        break;
    }
  });

  return changeStream;
}

module.exports = initOrderWatcher;