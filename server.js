// server.js
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { connectDB } = require('./CrDB');
const initWatchers = require('./src/realtime/watchers.js');
const startScheduler = require('./src/services/scheduler.service');

async function startServer() {
  await connectDB();

  startScheduler();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  
  initWatchers(io);

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    //ELIMINAR A LA HORA DE PONER EN PRODUCCION
    console.log(`Servidor iniciado en puerto: ${PORT}`);
  });

  io.on('connection', (socket) => {

  console.log('Cliente conectado:', socket.id);

  socket.on('joinRestaurante', (restauranteId) => {
    socket.join(`restaurante_${restauranteId}`);
    console.log(`Cliente unido a restaurante ${restauranteId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });


    io.on('connection', (socket) => {

    socket.on('joinRestaurante', (restauranteId) => {
        socket.join(`restaurante_${restauranteId}`);
    });

    });

});
}

startServer();