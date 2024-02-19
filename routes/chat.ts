import express from 'express';
import Server from 'socket.io';
import { createServer } from 'http';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import { upload } from '../util/fileupload';
import fs from 'fs';
import path from 'path';

const app = express();
const router = express.Router();
const httpServer = createServer(app);
const publicRoom = 'public';

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3001'],
    },
});
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Sang33hoon3!',
    database: 'review_data',
};

const currentTime = new Date();
const month = String(currentTime.getMonth() + 1).padStart(2, '0');
const day = String(currentTime.getDate()).padStart(2, '0');
const hours = String(currentTime.getHours()).padStart(2, '0');
const minutes = String(currentTime.getMinutes()).padStart(2, '0');
const seconds = String(currentTime.getSeconds()).padStart(2, '0');
const MonthDayTime = `${month}_${day}_${hours}:${minutes}:${seconds}`;
const fileName = `Message_${MonthDayTime}.txt`;
const filePath = path.join(__dirname, '../public/uploads', fileName);

var roomList = ['public'];
var roomNow = '';

app.use(bodyParser.urlencoded({ extended: true }));

router.get('/', function (req, res) {
    res.render('chat', { title: 'Chat page' });
});

router.post('/user_check', async (req, res) => {
    try {
        const { userId } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        console.log('바디정보', userId);
        let check = [];

        check = await connection.execute('SELECT * FROM TB_USER WHERE userId = ?', [userId]);
        let checkFirst = check[0];
        console.log('체크안냐오냐왜', checkFirst, '요건뭐노');

        if (check[0].length > 0) {
            console.log('기존 유저');
            res.json({ message: 'userId data saved successfully', checkFirst });
        } else {
            console.log('새 유저');
            res.json({ message: 'userId data saved successfully', checkFirst });
        }
        connection.end();
    } catch (err) {
        console.log('err:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/user_add', async (req, res) => {
    try {
        const { userId, nickname } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        console.log('유저 추가 바디 정보', nickname, '유저아디', userId, '유저아디');

        let check = [];
        check = await connection.execute('SELECT * FROM TB_USER WHERE userId = ?', [userId]);
        let checkFirst = check[0];

        console.log('첵스초코',checkFirst);

        if (check.length > 0) {
            const result = await connection.execute('INSERT INTO TB_USER (userId, nickname) VALUES (?,?)', [userId, nickname]);
            console.log('새 유저 추가 성공');
            res.json({ message: 'userId data saved successfully', result });
        } else if (userId !== checkFirst[0].userId) {
            const result = await connection.execute('INSERT INTO TB_USER (userId, nickname) VALUES (?,?)', [userId, nickname]);
            console.log('새 유저 추가 성공');
            res.json({ message: 'userId data saved successfully', result });
        } else if (userId == null || userId === ''){
            const result = await connection.execute('INSERT INTO TB_USER (userId, nickname) VALUES (?,?)', [userId, nickname]);
            console.log('시크릿 창 모드 유저 추가 성공');
            res.json({ message: 'userId data saved successfully', result });
        } else {
            console.log('새 유저 추가 실패');
        }
        connection.end();
    } catch (err) {
        console.log('err:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/save_chat', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const receivedData = req.body;
        const { socketId, content, nickname, roomNow } = req.body;

        fs.writeFileSync(filePath, content, 'utf-8');

        console.log('데이터 받은거', receivedData);
        console.log('파일이 저장되었습니다:', filePath);

        const result = await connection.execute('INSERT INTO TB_USER_CHAT (socketId, content, type, addedAt, nickname, roomNow) VALUES (?,?,?,?,?,?)', [
            socketId,
            content,
            1,
            currentTime,
            nickname,
            roomNow,
        ]);
        connection.end();
        res.status(200).json({ message: 'Message data saved successfully' });
    } catch (err) {
        console.log('err:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/save_file', upload.single('file'), async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const receivedData = req.body;
        const receivedFile = req.file;
        const { socketId, file, nickname, roomNow } = req.body;
        console.log('바디', receivedData, '파일', receivedFile, '마임타입', receivedFile.mimetype);
        let type = '';

        if (receivedFile.mimetype === 'image/png') {
            type = '3';
        } else {
            type = '2';
        }

        const result = await connection.execute('INSERT INTO TB_USER_CHAT (socketId, content, type, addedAt, nickname, roomNow) VALUES (?,?,?,?,?,?)', [
            socketId || null,
            receivedFile.path || null,
            type || null,
            currentTime || null,
            nickname || null,
            roomNow || null,
        ]);
        connection.end();
        res.status(200).json({ message: 'File data saved successfully' });
    } catch (err) {
        console.log('err:', err);
        res.status(500).json({ message: 'Server Error' });
    }
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
