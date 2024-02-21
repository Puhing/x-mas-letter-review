import multer from "multer";
import { fileName } from "./time";

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "public/uploads/");
    },
    filename: function (req, file, callback) {
        const utf8FileName = Buffer.from(file.originalname, 'binary').toString('utf-8');

        if (file.mimetype === 'image/png'){
            callback(null, "img_" + fileName + utf8FileName + ".jpeg");
        } else {
            callback(null, "audio_" + fileName + utf8FileName + ".webm");
        }
    },
});

const limits = {
    filedSize: 1024 * 1024, 
    fileSize: 1024 * 1024 * 20, // 20mb
    files: 10,
};

export const upload = multer({
    limits: limits, // 이미지 업로드 제한 설정
    storage: storage,
});
