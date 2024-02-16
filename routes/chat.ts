import express from 'express';
import Server from 'socket.io';
import { Socket } from 'socket.io';
import { createServer } from 'http';
import mysql from 'mysql2';
// import fs from "fs";

const app = express();
const router = express.Router();
const httpServer = createServer(app);
const publicRoom = 'public';
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3001'],
    },
});
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sang33hoon3!',
    database: 'review_data',
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');

    // 데이터베이스에서 데이터 조회
    connection.query('SELECT * FROM TB_USER_CHAT', (error, results, fields) => {
        if (error) throw error;
        console.log('Query results:', results);

        // 연결 종료
        connection.end();
    });
});

var roomList = ['public'];
var roomNow = '';

router.get('/', function (req, res) {
    res.render('chat', { title: 'Chat page' });
});

io.on('connection', socket => {
    socket.join(publicRoom);

    console.log('방정보와 유저수 확인용', socket.adapter.rooms, '방정보와 유저수 확인용');

    socket.on('send-message', (message, nicknameReceive, room) => {
        roomNow = room;
        if (roomNow === 'public') {
            socket.to(publicRoom).emit('receive-message', message, nicknameReceive, publicRoom);
            console.log('퍼블릭 방 채팅');
        } else {
            socket.to(roomNow).emit('receive-message', message, nicknameReceive, roomNow);
            console.log(`${roomNow} 방 채팅입니다`);
        }
    });

    socket.on('join-room', room => {
        socket.join(room);
        socket.emit('current-room', room);
        if (!roomList.includes(room)) {
            roomList.push(room);
            roomNow = room;
            console.log('방 리스트', roomList, '방 정보들', socket.adapter.rooms);
        } else {
            console.log('방 리스트', roomList, '방 정보들2', socket.adapter.rooms);
            return;
        }
    });

    socket.on('leave-room', room => {
        socket.leave(room);
        let roomToRemove = roomList.indexOf(room);
        if (roomToRemove !== -1) {
            roomList.splice(roomToRemove, 1);
        }
        roomNow = roomList[roomList.length - 1];
        console.log('해당: ', room, '방 나감', '룸리스트', roomList, '룸나우', roomNow);
    });
});

httpServer.listen(3002, () => {
    console.log('Socket.io chat server is running on port 3002');
});

export default router;
