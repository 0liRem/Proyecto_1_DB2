const { getDB } = require('../../CrDB');

function initWatchers(io) {
  const db = getDB();

  const collectionsToWatch = [
    'ordenes',
    'menu_items',
    'restaurantes',
    'usuarios'
  ];

  collectionsToWatch.forEach(collectionName => {

    const changeStream = db.collection(collectionName).watch([], {
      fullDocument: 'updateLookup'
    });

    console.log(`Change Stream activo para ${collectionName}`);

    changeStream.on('change', (change) => {

      const doc = change.fullDocument;

      if (!doc) return;

      // Ignorar soft deleted
      if (doc.eliminado === true) return;

      handleEvent(io, collectionName, change.operationType, doc);

    });

  });
}

function handleEvent(io, collection, operationType, doc) {

  switch (collection) {

    case 'ordenes':
      handleOrden(io, operationType, doc);
      break;

    case 'menu_items':
      handleInventario(io, operationType, doc);
      break;

    case 'restaurantes':
      handleRestaurante(io, operationType, doc);
      break;

    case 'usuarios':
      handleUsuario(io, operationType, doc);
      break;
  }
}

function handleOrden(io, type, doc) {
  const room = `restaurante_${doc.restauranteId}`;

  if (type === 'insert')
    io.to(room).emit('orden:nueva', doc);

  if (type === 'update')
    io.to(room).emit('orden:actualizada', doc);
}

function handleInventario(io, type, doc) {
  const room = `restaurante_${doc.restauranteId}`;

  if (type === 'insert')
    io.to(room).emit('inventario:nuevo', doc);

  if (type === 'update')
    io.to(room).emit('inventario:actualizado', doc);
}

function handleRestaurante(io, type, doc) {
  if (type === 'insert')
    io.emit('restaurante:nuevo', doc);
}

function handleUsuario(io, type, doc) {
  if (type === 'insert')
    io.emit('usuario:nuevo', {
      _id: doc._id,
      nombre: doc.nombre,
      tipo: doc.tipo
    });
}

module.exports = initWatchers;