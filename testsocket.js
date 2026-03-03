const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Conectado al servidor");

  socket.emit("joinRestaurante", "ID_DEL_RESTAURANTE");
});

socket.on("orden:nueva", data => {
  console.log("Nueva orden recibida:", data);
});

socket.on("inventario:nuevo", data => {
  console.log("Nuevo item inventario:", data);
});