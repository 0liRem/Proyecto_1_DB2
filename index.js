//          DOCUMENTACIÓN INTERNA
//
//   Proyecto: Sistema de Restaurantes - API Backend
//   Programadores:
//          Oli Viau 23544
//          Fabian Morales 23267
//
//
//   Historial de modificaciones
//
//          [000] 25/2/2026 Programa nuevo
//
//
//   Base de datos: MongoDB con Node.js
//   Colecciones: restaurantes, usuarios, menu_items, ordenes, resenas, categorias, promociones
//

require('dotenv').config();
const { connectDB, getDB } = require('./CrDB.js');
const { ObjectId } = require('mongodb');

async function main() {
  try {
    // Conectar a la base de datos
    const db = await connectDB();
    console.log('Sistema de Restaurantes inicializado correctamente');

    // AÑADIR PRUEBAS PARA VERIFICAR LA DB
    await insertarDatosPrueba(db);
    
    await analizarConsultaSinIndice(db)
    await analizarConsultaConIndice(db)

  } catch (error) {
    console.error('Error en la aplicación:', error);
  } finally {
  }
}


//Para pruebas BORRAR CON LA ENTREGA
async function insertarDatosPrueba(db) {
  try {
    console.log('\nInsertando datos de prueba...');

    const restaurantesCount = await db.collection('restaurantes').countDocuments();
    
    if (restaurantesCount === 0) {
      
      const restaurante = {
        nombre: "La Casa de la Pasta",
        direccion: "Av. Reforma 123, Ciudad de Guatemala",
        ubicacion: {
          type: "Point",
          coordinates: [-90.5066, 14.6349] 
        },
        horario: [
          { dia: "lunes", apertura: "08:00", cierre: "22:00", cerrado: false },
          { dia: "martes", apertura: "08:00", cierre: "22:00", cerrado: false },
          { dia: "miércoles", apertura: "08:00", cierre: "22:00", cerrado: false },
          { dia: "jueves", apertura: "08:00", cierre: "22:00", cerrado: false },
          { dia: "viernes", apertura: "08:00", cierre: "23:00", cerrado: false },
          { dia: "sábado", apertura: "09:00", cierre: "23:00", cerrado: false },
          { dia: "domingo", apertura: "09:00", cierre: "21:00", cerrado: false }
        ],
        telefono: "+502 2345-6789",
        categorias: ["italiana", "pasta", "pizza"],
        activo: true,
        fechaRegistro: new Date()
      };

      const result = await db.collection('restaurantes').insertOne(restaurante);
      const restauranteId = result.insertedId;

      console.log(`Restaurante de prueba insertado con ID: ${restauranteId}`);

    
      const menuItems = [
        {
          restauranteId: restauranteId,
          nombre: "Spaghetti Carbonara",
          descripcion: "Pasta con salsa de huevo, queso pecorino, panceta y pimienta negra",
          precio: 89.50,
          categoria: "pastas",
          disponible: true,
          ingredientes: ["pasta", "huevo", "queso pecorino", "panceta", "pimienta"],
          personalizaciones: [
            { nombre: "Porción extra de queso", opciones: ["si", "no"], precioExtra: 15.00 },
            { nombre: "Tipo de pasta", opciones: ["spaghetti", "fettuccine", "penne"], precioExtra: 0 }
          ]
        },
        {
          restauranteId: restauranteId,
          nombre: "Pizza Margherita",
          descripcion: "Pizza con salsa de tomate, mozzarella fresca, albahaca y aceite de oliva",
          precio: 75.00,
          categoria: "pizzas",
          disponible: true,
          ingredientes: ["masa", "salsa tomate", "mozzarella", "albahaca", "aceite oliva"],
          personalizaciones: [
            { nombre: "Tamaño", opciones: ["personal", "mediana", "familiar"], precioExtra: [0, 25, 50] },
            { nombre: "Extra queso", opciones: ["si", "no"], precioExtra: 12.00 }
          ]
        }
      ];

      await db.collection('menu_items').insertMany(menuItems);
      console.log(` ${menuItems.length} items de menú insertados`);

      const usuario = {
        nombre: "Juan Pérez",
        email: "juan.perez@email.com",
        password: "$2b$10$hashed_password_aqui", 
        telefono: "+502 5123-4567",
        direcciones: [
          {
            alias: "Casa",
            direccion: "Zona 10, Ciudad de Guatemala",
            coordenadas: [-90.5123, 14.6123]
          }
        ],
        tipo: "cliente",
        fechaRegistro: new Date(),
        ultimaSesion: new Date()
      };

      const usuarioResult = await db.collection('usuarios').insertOne(usuario);
      console.log(` Usuario de prueba insertado con ID: ${usuarioResult.insertedId}`);

      // Verificar que los índices funcionan
      console.log('\Probando índices...');
      
      // Prueba de índice geoespacial
      const restaurantesCercanos = await db.collection('restaurantes').find({
        ubicacion: {
          $near: {
            $geometry: { type: "Point", coordinates: [-90.5066, 14.6349] },
            $maxDistance: 5000
          }
        }
      }).limit(1).toArray();
      
      console.log(`Búsqueda geoespacial: ${restaurantesCercanos.length} restaurantes encontrados`);

    } else {
      console.log('ℹYa existen datos en la base de datos, omitiendo inserción de prueba');
    }

  } catch (error) {
    console.error('Error insertando datos de prueba:', error);
  }
}


process.on('SIGINT', async () => {
  console.log('\nCerrando conexión a MongoDB...');
  try {
    const { getDB } = require('./CrDB.js');
    const db = getDB();
    if (db) {
      await db.client.close();
      console.log('Conexión cerrada correctamente');
    }
  } catch (error) {
    console.error(' Error cerrando conexión:', error);
  }
  process.exit(0);
});



async function analizarConsultaSinIndice(db) {
  try {
    console.log('\nANÁLISIS SIN ÍNDICE:');
    
    // Crear un ObjectId válido para la prueba
    const restauranteId = new ObjectId(); 
    
    const result = await db.collection('ordenes').find({
      restauranteId: restauranteId,
      estado: 'pendiente'
    }).sort({ fechaCreacion: -1 }).explain('executionStats');
    
    console.log(`- Plan de ejecución:`);
    console.log(`  • Etapa principal: ${result.queryPlanner.winningPlan.stage}`);
    if (result.queryPlanner.winningPlan.inputStage) {
      console.log(`  • Etapa de entrada: ${result.queryPlanner.winningPlan.inputStage.stage}`);
    }
    console.log(`- Estadísticas de ejecución:`);
    console.log(`  • Documentos examinados: ${result.executionStats.totalDocsExamined}`);
    console.log(`  • Documentos retornados: ${result.executionStats.nReturned}`);
    console.log(`  • Tiempo de ejecución: ${result.executionStats.executionTimeMillis}ms`);
    
    return result;
  } catch (error) {
    console.log('ℹ No hay datos suficientes para análisis sin índice');
    return null;
  }
}

async function analizarConsultaConIndice(db) {
  try {
    console.log('\nANÁLISIS CON ÍNDICE:');
    
    const restauranteId = new ObjectId();
    
    const result = await db.collection('ordenes').find({
      restauranteId: restauranteId,
      estado: 'pendiente'
    }).sort({ fechaCreacion: -1 }).hint('ordenes_restaurante_estado').explain('executionStats');
    
    console.log(`- Plan de ejecución:`);
    if (result.queryPlanner.winningPlan.inputStage) {
      console.log(`  • Índice usado: ${result.queryPlanner.winningPlan.inputStage.indexName || 'No especificado'}`);
      console.log(`  • Etapa: ${result.queryPlanner.winningPlan.inputStage.stage}`);
    }
    console.log(`- Estadísticas de ejecución:`);
    console.log(`  • Documentos examinados: ${result.executionStats.totalDocsExamined}`);
    console.log(`  • Documentos retornados: ${result.executionStats.nReturned}`);
    console.log(`  • Tiempo de ejecución: ${result.executionStats.executionTimeMillis}ms`);
    console.log(`  • Claves de índice examinadas: ${result.executionStats.totalKeysExamined}`);
    
    return result;
  } catch (error) {
    console.log('ℹNo se pudo ejecutar análisis con índice');
    return null;
  }
}


main();