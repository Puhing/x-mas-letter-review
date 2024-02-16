import multer from "multer";

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "public/uploads/");
    },
    filename: function (req, file, callback) {
        console.log('멀터 진입');
        if (file.mimetype.startsWith('image/png')) {
            callback(null, Date.now() + "img_" + file.originalname + ".jpeg");
        } else if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
            callback(null, Date.now() + "aud/vid_" + file.originalname + ".webm");
        } else {
            callback(null, Date.now() + "txt_" + file.originalname + ".txt");
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
