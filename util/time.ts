import path from 'path';

const currentTime = new Date();
const month = String(currentTime.getMonth() + 1).padStart(2, '0');
const day = String(currentTime.getDate()).padStart(2, '0');
const hours = String(currentTime.getHours()).padStart(2, '0');
const minutes = String(currentTime.getMinutes()).padStart(2, '0');
const seconds = String(currentTime.getSeconds()).padStart(2, '0');
const MonthDayTime = `${month}_${day}_${hours}:${minutes}:${seconds}`;
const fileName = `Message_${MonthDayTime}.txt`;
const filePath = path.join(__dirname, '../public/uploads', fileName);

export { filePath, fileName }