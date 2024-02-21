import express from 'express';
import bodyParser from 'body-parser';
import MySQL from '../MySQL';
import fs from 'fs';
import { upload } from '../util/fileupload';
import { filePath } from '../util/time';
import { io } from '../util/io';

const app = express();
const router = express.Router();
const currentTime = new Date();
const db = MySQL.write();
const publicRoom = 'public';

var roomList = ['public'];
var roomNow = '';

app.use(bodyParser.urlencoded({ extended: true }));

router.get('/', function (req, res) {
    res.render('chat', { title: 'Chat page' });
});

router.post('/user_check', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log('유저체크 바디정보', userId);

        let check = await db.one('SELECT * FROM TB_USER WHERE userId = ?', [userId]);
        console.log('체크안냐오냐왜', check, '요건뭐노');

        if (check === undefined) {
            console.log('새 유저');
            res.json({ status: -1, message: 'New user', check });
        } else {
            console.log('기존 유저');
            res.json({ status: 1, message: 'Existing user', check });
        }
    } catch (err) {
        console.log('err:', err);
        res.status(500).json({ message: 'Server Error(user_check)' });
    }
});

router.post('/user_add', async (req, res) => {
    try {
        const { userId, nickname } = req.body;
        console.log('유저 추가 바디 정보', nickname, '유저아디', userId, '유저아디');

        let check = await db.one('SELECT * FROM TB_USER WHERE userId = ?', [userId]);

        console.log('첵스초코', check);

        if (check === undefined) {
            const result = await db.query('INSERT INTO TB_USER (userId, nickname) VALUES (?,?)', [userId, nickname]);
            console.log('새 유저 추가 성공');
            res.json({ message: 'userId data saved successfully', result });
        } else if (userId == null || userId === '') {
            const result = await db.query('INSERT INTO TB_USER (userId, nickname) VALUES (?,?)', [userId, nickname]);
            console.log('시크릿 창 모드 유저 추가 성공');
            res.json({ message: 'userId data saved successfully', result });
        } else {
            console.log('새 유저 추가 실패');
        }
    } catch (err) {
        console.log('err:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/save_chat', async (req, res) => {
    try {
        const receivedData = req.body;
        const { socketId, content, nickname, roomNow } = req.body;

        fs.writeFileSync(filePath, content, 'utf-8');

        console.log('데이터 받은거', receivedData);
        console.log('파일이 저장되었습니다:', filePath);

        const result = await db.query('INSERT INTO TB_USER_CHAT (socketId, content, type, addedAt, nickname, roomNow) VALUES (?,?,?,?,?,?)', [
            socketId,
            content,
            1,
            currentTime,
            nickname,
            roomNow,
        ]);
        res.status(200).json({ message: 'Message data saved successfully' });
    } catch (err) {
        console.log('err:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/save_file', upload.single('file'), async (req, res) => {
    try {
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

        const result = await db.query('INSERT INTO TB_USER_CHAT (socketId, content, type, addedAt, nickname, roomNow) VALUES (?,?,?,?,?,?)', [
            socketId,
            receivedFile.path,
            type,
            currentTime,
            nickname,
            roomNow,
        ]);
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

    socket.on('send-file', file => {
        io.emit('receive-file', file);
    });
});

export default router;
