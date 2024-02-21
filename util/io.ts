import express from 'express';
import Server from 'socket.io';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3001'],
    },
});

httpServer.listen(3002, () => {
    console.log('Socket.io chat server is running on port 3002');
});

export { io }