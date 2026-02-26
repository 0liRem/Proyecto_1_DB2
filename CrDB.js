require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'restaurantes_db';

// Configuración corregida - apiStrict: false para permitir índices de texto
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,  // Cambiado de true a false
    deprecationErrors: true,
  }
});

let db = null;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`Conectado a MongoDB: ${dbName}`);
    
    // Verificar/Crear colecciones y sus índices
    await initializeCollections();
    
    return db;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function initializeCollections() {
  try {
    // Lista de colecciones requeridas
    const requiredCollections = [
      'restaurantes',
      'usuarios',
      'menu_items',
      'ordenes',
      'resenas',
      'categorias',
      'promociones'
    ];

    // Obtener colecciones existentes
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(col => col.name);

    // Crear colecciones que no existen
    for (const collectionName of requiredCollections) {
      if (!existingNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`Colección creada: ${collectionName}`);
      }
    }

    // Crear índices para cada colección
    await createIndexes();

  } catch (error) {
    console.error('Error inicializando colecciones:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Índices para Restaurantes
    await db.collection('restaurantes').createIndex(
      { ubicacion: "2dsphere" },
      { name: "geo_index" }
    );
    await db.collection('restaurantes').createIndex(
      { nombre: 1 },
      { name: "nombre_index" }
    );
    console.log('indices de restaurantes creados');

    // Índices para Usuarios
    await db.collection('usuarios').createIndex(
      { email: 1 },
      { unique: true, name: "email_unique" }
    );
    await db.collection('usuarios').createIndex(
      { tipo: 1 },
      { name: "tipo_index" }
    );
    console.log('indices de usuarios creados');

    // Índices para Menu Items
    await db.collection('menu_items').createIndex(
      { restauranteId: 1, categoria: 1, precio: 1 },
      { name: "restaurante_categoria_precio" }
    );
    
    // Índice de texto - AHORA FUNCIONARÁ con strict: false
    await db.collection('menu_items').createIndex(
      { nombre: "text", descripcion: "text" },
      { 
        name: "menu_text_search",
        default_language: "spanish", // Opcional: especificar idioma
        weights: { nombre: 10, descripcion: 5 } // Opcional: dar más peso al nombre
      }
    );
    console.log('indices de menú creados');

    // Índices para Órdenes
    await db.collection('ordenes').createIndex(
      { restauranteId: 1, estado: 1, fechaCreacion: -1 },
      { name: "ordenes_restaurante_estado" }
    );
    await db.collection('ordenes').createIndex(
      { usuarioId: 1, fechaCreacion: -1 },
      { name: "ordenes_usuario" }
    );
    await db.collection('ordenes').createIndex(
      { repartidorId: 1, estado: 1 },
      { name: "ordenes_repartidor" }
    );
    console.log('indices de órdenes creados');

    // Índices para Reseñas
    await db.collection('resenas').createIndex(
      { restauranteId: 1, calificacion: -1 },
      { name: "resenas_restaurante" }
    );
    
    // Índice de texto para reseñas
    await db.collection('resenas').createIndex(
      { comentario: "text" },
      { 
        name: "resenas_text_search",
        default_language: "spanish"
      }
    );
    
    await db.collection('resenas').createIndex(
      { usuarioId: 1, restauranteId: 1 },
      { unique: true, name: "unique_usuario_restaurante" }
    );
    console.log('indices de reseñas creados');

    // Índices para Promociones
    await db.collection('promociones').createIndex(
      { codigo: 1 },
      { unique: true, name: "codigo_unique" }
    );
    await db.collection('promociones').createIndex(
      { restauranteId: 1, vigencia: 1 },
      { name: "promociones_restaurante_vigencia" }
    );
    console.log('indices de promociones creados');

  } catch (error) {
    console.error('Error creando índices:', error);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a connectDB primero.');
  }
  return db;
}

module.exports = { connectDB, getDB };