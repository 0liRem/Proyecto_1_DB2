const { getDB } = require('../../CrDB');

/*
1️⃣ Top productos vendidos
*/
exports.topProductosVendidos = async (req, res) => {
  try {
    const db = getDB();

    const pipeline = [
      { $match: { estado: "entregada", eliminado: { $ne: true } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          totalVendidos: { $sum: "$items.cantidad" }
        }
      },
      {
        $lookup: {
          from: "menu_items",
          localField: "_id",
          foreignField: "_id",
          as: "producto"
        }
      },
      { $unwind: "$producto" },
      {
        $project: {
          _id: 0,
          nombre: "$producto.nombre",
          valor: "$totalVendidos"
        }
      },
      { $sort: { valor: -1 } },
      { $limit: 5 }
    ];

    const data = await db.collection('ordenes').aggregate(pipeline).toArray();
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
2️⃣ Ventas por restaurante
*/
exports.ventasPorRestaurante = async (req, res) => {
  try {
    const db = getDB();

    const pipeline = [
      { $match: { estado: "entregada", eliminado: { $ne: true } } },
      {
        $group: {
          _id: "$restauranteId",
          totalVentas: { $sum: "$total" },
          totalOrdenes: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "restaurantes",
          localField: "_id",
          foreignField: "_id",
          as: "restaurante"
        }
      },
      { $unwind: "$restaurante" },
      {
        $project: {
          _id: 0,
          nombre: "$restaurante.nombre",
          valor: "$totalVentas",
          totalOrdenes: 1
        }
      },
      { $sort: { valor: -1 } }
    ];

    const data = await db.collection('ordenes').aggregate(pipeline).toArray();
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
3️⃣ Segmentación de clientes
*/
exports.segmentacionClientes = async (req, res) => {
  try {
    const db = getDB();

    const pipeline = [
      { $match: { estado: "entregada", eliminado: { $ne: true } } },
      {
        $group: {
          _id: "$usuarioId",
          totalOrdenes: { $sum: 1 }
        }
      },
      {
        $addFields: {
          categoria: {
            $switch: {
              branches: [
                { case: { $gte: ["$totalOrdenes", 10] }, then: "frecuente" },
                { case: { $gte: ["$totalOrdenes", 5] }, then: "ocasional" }
              ],
              default: "nuevo"
            }
          }
        }
      },
      {
        $group: {
          _id: "$categoria",
          totalClientes: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          nombre: "$_id",
          valor: "$totalClientes"
        }
      },
      { $sort: { valor: -1 } }
    ];

    const data = await db.collection('ordenes').aggregate(pipeline).toArray();
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
4️⃣ Rating promedio por restaurante
*/
exports.ratingRestaurantes = async (req, res) => {
  try {
    const db = getDB();

    const pipeline = [
      { $match: { eliminado: { $ne: true } } },
      {
        $group: {
          _id: "$restauranteId",
          ratingPromedio: { $avg: "$calificacion" },
          totalResenas: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "restaurantes",
          localField: "_id",
          foreignField: "_id",
          as: "restaurante"
        }
      },
      { $unwind: "$restaurante" },
      {
        $project: {
          _id: 0,
          nombre: "$restaurante.nombre",
          valor: { $round: ["$ratingPromedio", 2] },
          totalResenas: 1
        }
      },
      { $sort: { valor: -1 } }
    ];

    const data = await db.collection('resenas').aggregate(pipeline).toArray();
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
5️⃣ Órdenes por estado
*/
exports.ordenesPorEstado = async (req, res) => {
  try {
    const db = getDB();

    const pipeline = [
      { $match: { eliminado: { $ne: true } } },
      {
        $group: {
          _id: "$estado",
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          nombre: "$_id",
          valor: "$total"
        }
      },
      { $sort: { valor: -1 } }
    ];

    const data = await db.collection('ordenes').aggregate(pipeline).toArray();
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
6️⃣ Ventas por día
*/
exports.ventasPorDia = async (req, res) => {
  try {
    const db = getDB();

    const pipeline = [
      {
        $match: {
          estado: "entregada",
          eliminado: { $ne: true }
        }
      },
      {
        $addFields: {
          fechaNormalizada: {
            $convert: {
              input: "$fechaCreacion",
              to: "date",
              onError: null,
              onNull: null
            }
          },
          totalNormalizado: {
            $convert: {
              input: "$total",
              to: "double",
              onError: 0,
              onNull: 0
            }
          }
        }
      },
      {
        $match: {
          fechaNormalizada: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$fechaNormalizada"
            }
          },
          totalVentas: { $sum: "$totalNormalizado" },
          totalOrdenes: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          nombre: "$_id",
          valor: "$totalVentas",
          totalOrdenes: 1
        }
      },
      { $sort: { nombre: 1 } }
    ];

    const data = await db.collection('ordenes').aggregate(pipeline).toArray();

    res.json({
      status: "success",
      data
    });
  } catch (error) {
    console.error("Error en ventasPorDia:", error);
    res.status(500).json({
      message: error.message
    });
  }
};


/*
7️⃣ Top restaurantes por ventas
*/
exports.topRestaurantes = async (req, res) => {
  try {
    const db = getDB();

    const pipeline = [
      { $match: { estado: "entregada", eliminado: { $ne: true } } },
      {
        $group: {
          _id: "$restauranteId",
          totalVentas: { $sum: "$total" }
        }
      },
      {
        $lookup: {
          from: "restaurantes",
          localField: "_id",
          foreignField: "_id",
          as: "restaurante"
        }
      },
      { $unwind: "$restaurante" },
      {
        $project: {
          _id: 0,
          nombre: "$restaurante.nombre",
          valor: "$totalVentas"
        }
      },
      { $sort: { valor: -1 } },
      { $limit: 5 }
    ];

    const data = await db.collection('ordenes').aggregate(pipeline).toArray();
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
8️⃣ Restaurantes cercanos
*/
exports.restaurantesCercanos = async (req, res) => {
  try {
    const db = getDB();
    const { lng, lat } = req.query;

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: "distancia",
          spherical: true,
          maxDistance: 3000
        }
      },
      {
        $project: {
          _id: 0,
          nombre: "$nombre",
          valor: "$distancia",
          direccion: 1
        }
      }
    ];

    const data = await db.collection('restaurantes').aggregate(pipeline).toArray();
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};