// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // React dev server
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // When someone joins room with name
    socket.on("joinRoom", (name) => {
        socket.userName = name;
        console.log(`${name} joined the room`);

        // Notify others
        socket.broadcast.emit("roomNotice", name);
    });

    // Handle chat message
    socket.on("chatMessage", (msg) => {
        console.log("Message received:", msg);

        // Send message to others (NOT sender)
        socket.broadcast.emit("chatMessage", msg);
    });

    // Typing events
    socket.on("typing", (userName) => {
        socket.broadcast.emit("typing", userName);
    });

    socket.on("stopTyping", (userName) => {
        socket.broadcast.emit("stopTyping", userName);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        if (socket.userName) {
            // optional: notify leave
            // socket.broadcast.emit("roomNotice", `${socket.userName} left the chat`);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Socket.io server running on http://localhost:${PORT}`);
});
