const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const path = require("path");
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit("userJoined", socket.id);
  });

  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice", ({ candidate, to }) => {
    io.to(to).emit("ice", { candidate, from: socket.id });
  });

  socket.on("chat", ({ roomId, text }) => {
    io.to(roomId).emit("chat", { text, from: socket.id });
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});