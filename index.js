const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

const lobbies = {};

io.on('connection', (socket) => {
    console.log(`a user connected: ${socket.id}`);

    socket.on('createLobby', () => {
        console.log('createLobby');
        lobbies[socket.id] = {
            id: socket.id,
            players: [socket.id],
        };

        socket.emit('lobbyCreated', socket.id);
    });

    socket.on('joinLobby', (lobbyId) => {
        console.log('joinLobby');
        lobbies[lobbyId].players.push(socket.id);
        socket.join(lobbyId);
    });

    socket.on('leaveLobby', (lobbyId) => {
        console.log('leaveLobby');
        lobbies[lobbyId].players = lobbies[lobbyId].players.filter(player => player !== socket.id);
        socket.leave(lobbyId);
    });

    socket.on('chat', (message) => {
        console.log('chat');
        io.to(message.lobbyId).emit('chat', message);
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected ${socket.id}`);
        Object.keys(lobbies).forEach(lobbyId => {
            lobbies[lobbyId].players = lobbies[lobbyId].players.filter(player => player !== socket.id);

            if (lobbies[lobbyId].players.length === 0) {
                delete lobbies[lobbyId];
            }

            socket.leave(lobbyId);
        });
    });
});

server.listen(3005, () => {
    console.log('listening on *:3005');
});
