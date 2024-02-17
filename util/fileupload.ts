import multer from "multer";

const currentTime = new Date();
const month = String(currentTime.getMonth() + 1).padStart(2, '0');
const day = String(currentTime.getDate()).padStart(2, '0');
const hours = String(currentTime.getHours()).padStart(2, '0');
const minutes = String(currentTime.getMinutes()).padStart(2, '0');
const seconds = String(currentTime.getSeconds()).padStart(2, '0');
const MonthDayTime = `${month}_${day}_${hours}:${minutes}:${seconds}`;
const fileName = `Message_${MonthDayTime}.txt`;

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
