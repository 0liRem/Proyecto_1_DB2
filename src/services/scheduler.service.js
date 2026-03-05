const cron = require('node-cron');
const { getDB } = require('../../CrDB');

function obtenerHoraCierreHoy(restaurante) {

  const hoy = new Date();
  const dias = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado'
  ];

  const nombreDia = dias[hoy.getDay()];

  const horarioHoy = restaurante.horario?.find(
    h => h.dia === nombreDia && !h.cerrado
  );

  if (!horarioHoy) return null;

  const [hora, minutos] = horarioHoy.cierre.split(':');

  const cierre = new Date();
  cierre.setHours(parseInt(hora));
  cierre.setMinutes(parseInt(minutos));
  cierre.setSeconds(0);

  return cierre;
}

function startScheduler() {

  console.log('🕒 Scheduler iniciado');

  // Ejecuta cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {

    try {

      const db = getDB();
      const now = new Date();

      const restaurantes = await db.collection('restaurantes')
        .find({ activo: true, eliminado: { $ne: true } })
        .toArray();

      for (const r of restaurantes) {

        const cierreHoy = obtenerHoraCierreHoy(r);

        if (!cierreHoy) continue;

        const treintaMinAntes =
          new Date(cierreHoy.getTime() - 30 * 60000);

        // Solo ejecutar si estamos dentro de la ventana
        if (now >= treintaMinAntes && now <= cierreHoy) {

          const result = await db.collection('ordenes')
            .updateMany(
              {
                restauranteId: r._id,
                estado: {
                  $nin: ['preparando', 'entregada', 'cancelada']
                },
                eliminado: { $ne: true }
              },
              {
                $set: { estado: 'cancelada' }
              }
            );

          if (result.modifiedCount > 0) {
            console.log(
              `⛔ ${result.modifiedCount} órdenes canceladas en ${r.nombre}`
            );
          }
        }
      }

    } catch (error) {
      console.error('Error en scheduler:', error);
    }

  });

}

module.exports = startScheduler;