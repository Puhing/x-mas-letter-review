import express from 'express';

import chat from './chat';

const router = express.Router();

router.get('/', function (req, res) {
    res.render('index', { title: 'Main page' });
});

router.use('/chat', chat);

export default router;
