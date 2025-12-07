const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const onlineUsers = {}; // socket.id -> name

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (name) => {
        socket.userName = name;
        onlineUsers[socket.id] = name;

        // send updated online users list to everyone
        io.emit("onlineUsers", Object.values(onlineUsers));

        // notice message to others
        socket.broadcast.emit("roomNotice", `${name} joined the chat`);
    });

    // broadcast chat message to others
    socket.on("chatMessage", (msg) => {
        socket.broadcast.emit("chatMessage", msg);
    });

    // user is marking messages as read
    socket.on("markRead", (messageIds) => {
        // broadcast to all others that these ids are read
        socket.broadcast.emit("messageRead", { messageIds });
    });

    socket.on("disconnect", () => {
        const name = socket.userName;
        delete onlineUsers[socket.id];
        io.emit("onlineUsers", Object.values(onlineUsers));

        if (name) {
            socket.broadcast.emit("roomNotice", `${name} left the chat`);
        }

        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});
