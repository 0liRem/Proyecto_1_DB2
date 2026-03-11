const { getDB } = require('../../CrDB');
const { ObjectId } = require('mongodb');

/* =========================================
   BULK CREATE MENU ITEMS
========================================= */
exports.bulkCreateMenu = async (req, res) => {
  try {
    const db = getDB();

    if (!['administrador', 'caja'].includes(req.user.tipo)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { data, restauranteId } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        message: 'Debes enviar un arreglo "data" con los items del menú'
      });
    }

    let targetRestauranteId = null;

    // Si es admin puede mandar restauranteId en body o usar el suyo
    if (req.user.tipo === 'administrador') {
      targetRestauranteId = restauranteId || req.user.restauranteId || null;

      if (!targetRestauranteId) {
        return res.status(400).json({
          message: 'Administrador debe indicar restauranteId o tener uno asignado'
        });
      }
    }

    // Si es caja solo usa su restaurante asignado
    if (req.user.tipo === 'caja') {
      if (!req.user.restauranteId) {
        return res.status(403).json({
          message: 'Usuario caja sin restaurante asignado'
        });
      }
      targetRestauranteId = req.user.restauranteId;
    }

    if (!ObjectId.isValid(targetRestauranteId)) {
      return res.status(400).json({
        message: 'restauranteId inválido'
      });
    }

    const menuItems = data.map(item => ({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio: Number(item.precio) || 0,
      categoria: item.categoria || 'general',
      disponible: item.disponible !== undefined ? item.disponible : true,
      ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
      personalizaciones: Array.isArray(item.personalizaciones) ? item.personalizaciones : [],
      restauranteId: new ObjectId(targetRestauranteId),
      eliminado: false,
      fechaRegistro: new Date()
    }));

    const result = await db.collection('menu_items').insertMany(menuItems);

    res.status(201).json({
      status: 'success',
      inserted: result.insertedCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   BULK UPDATE MENU ITEMS
========================================= */
exports.bulkUpdateMenu = async (req, res) => {
  try {
    const db = getDB();

    if (!['administrador', 'caja'].includes(req.user.tipo)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: 'Debes enviar un arreglo "updates"'
      });
    }

    let restauranteId = req.user.restauranteId || null;

    if (!restauranteId) {
      return res.status(403).json({
        message: 'Usuario sin restaurante asignado'
      });
    }

    if (!ObjectId.isValid(restauranteId)) {
      return res.status(400).json({
        message: 'restauranteId inválido'
      });
    }

    const operations = updates
      .filter(u => u._id && ObjectId.isValid(u._id))
      .map(u => ({
        updateOne: {
          filter: {
            _id: new ObjectId(u._id),
            restauranteId: new ObjectId(restauranteId)
          },
          update: {
            $set: {
              ...(u.nombre !== undefined && { nombre: u.nombre }),
              ...(u.descripcion !== undefined && { descripcion: u.descripcion }),
              ...(u.precio !== undefined && { precio: Number(u.precio) }),
              ...(u.categoria !== undefined && { categoria: u.categoria }),
              ...(u.disponible !== undefined && { disponible: u.disponible }),
              ...(u.ingredientes !== undefined && { ingredientes: u.ingredientes }),
              ...(u.personalizaciones !== undefined && { personalizaciones: u.personalizaciones })
            }
          }
        }
      }));

    if (operations.length === 0) {
      return res.status(400).json({
        message: 'No hay operaciones válidas para actualizar'
      });
    }

    const result = await db.collection('menu_items').bulkWrite(operations);

    res.status(200).json({
      status: 'success',
      matched: result.matchedCount,
      modified: result.modifiedCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   BULK CREATE RESTAURANTES
========================================= */
exports.bulkCreateRestaurantes = async (req, res) => {
  try {
    const db = getDB();

    if (req.user.tipo !== 'administrador') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        message: 'Debes enviar un arreglo "data"'
      });
    }

    const restaurantes = data.map(r => ({
      nombre: r.nombre,
      direccion: r.direccion || '',
      ubicacion: r.ubicacion || null,
      horario: Array.isArray(r.horario) ? r.horario : [],
      activo: true,
      eliminado: false,
      fechaRegistro: new Date()
    }));

    const result = await db.collection('restaurantes').insertMany(restaurantes);

    res.status(201).json({
      status: 'success',
      inserted: result.insertedCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};