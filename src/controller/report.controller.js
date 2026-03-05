const ExcelJS = require('exceljs');
const { getDB } = require('../../CrDB');
const { ObjectId } = require('mongodb');

exports.ventasReport = async (req, res) => {

  const db = getDB();
  const user = req.user;

  const { desde, hasta } = req.query;

  const matchStage = {
    estado: { $in: ['entregada', 'preparando'] },
    eliminado: { $ne: true }
  };

  // Multi-tenant restriction
  if (user.tipo !== 'administrador') {
    matchStage.restauranteId =
      new ObjectId(user.restauranteId);
  }

  if (desde && hasta) {
    matchStage.fechaCreacion = {
      $gte: new Date(desde),
      $lte: new Date(hasta)
    };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: "$restauranteId",
        totalVentas: { $sum: "$total" },
        totalOrdenes: { $sum: 1 }
      }
    }
  ];

  const data = await db.collection('ordenes')
    .aggregate(pipeline)
    .toArray();

  // Crear Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte Ventas');

  worksheet.columns = [
    { header: 'Restaurante ID', key: 'restauranteId', width: 30 },
    { header: 'Total Ventas', key: 'totalVentas', width: 20 },
    { header: 'Total Órdenes', key: 'totalOrdenes', width: 20 }
  ];

  data.forEach(row => {
    worksheet.addRow({
      restauranteId: row._id.toString(),
      totalVentas: row.totalVentas,
      totalOrdenes: row.totalOrdenes
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader(
    'Content-Disposition',
    'attachment; filename=reporte_ventas.xlsx'
  );

  await workbook.xlsx.write(res);
  res.end();
};