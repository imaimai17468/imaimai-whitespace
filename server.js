// server.js
const { Server } = require("socket.io");

const PORT = 3001;
const io = new Server(PORT, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });
});

console.log(`Server started on http://localhost:${PORT}`);
