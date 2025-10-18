// server.js
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors()); // allow cross-origin requests

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }, // allow all origins
});

// Optional: track users in rooms
const roomsUsers = {};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join room
  socket.on("join", (data) => {
    const room = data.room || "general";
    const username = data.username || "Anonymous";

    socket.join(room);
    roomsUsers[room] = roomsUsers[room] || new Set();
    roomsUsers[room].add(username);

    io.to(room).emit("system", { message: `${username} joined the room.` });
    console.log(`${username} joined room ${room}`);
  });

  // Leave room
  socket.on("leave", (data) => {
    const room = data.room || "general";
    const username = data.username || "Anonymous";

    socket.leave(room);
    roomsUsers[room]?.delete(username);

    io.to(room).emit("system", { message: `${username} left the room.` });
    console.log(`${username} left room ${room}`);
  });

  // Chat message
  socket.on("send_message", (data) => {
    const room = data.room || "general";
    const username = data.username || "Anonymous";
    const content = data.content || "";

    if (content.trim() === "") return;

    io.to(room).emit("new_message", { username, content });
    console.log(`[${room}] ${username}: ${content}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Optional: handle root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = 5000;
server.listen(PORT, () =>
  console.log(`ChatConnect Node server running on http://localhost:${PORT}`)
);
