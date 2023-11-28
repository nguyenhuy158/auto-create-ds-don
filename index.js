const express = require('express');
const xlsx = require('xlsx');
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const { readArrayFromFile, writeArrayToFile } = require('./utils');
const multer = require('multer');
const names = ['ai đó', 'một người ẩn danh', 'ai đó hong biết luôn', 'một người lạ', 'một người nào đó', 'người dùng ẩn danh', 'một người dễ thương nào đó'];

const upload = multer({ dest: 'uploads/' });


const {
    removeOldFiles,
    taoDanhSachCuaMotNgay,
    taoDanhSachCuaNhieuNgay
} = require('./process');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        removeOldFiles();

        if (req.file.originalname.endsWith('.xlsx') || req.file.originalname.endsWith('.xls')) {
            console.log(req.file);

            let oldPath = req.file.path;
            let newPath = path.join(path.dirname(oldPath), 'DS_NopDon_' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + '.xlsx');
            let filename = path.basename(newPath);

            fs.rename(oldPath, newPath, async (err) => {
                if (err) {
                    res.json({ error: true, message: `File rename failed: ${err}` });
                } else {
                    console.log(req.file);
                    res.json({ error: false, message: `File uploaded and renamed successfully ${filename}`, filename });
                }
                await writeArrayToFile({
                    filename,
                    date: moment().format('DD/MM/YYYY HH:mm'),
                    name: names[Math.floor(Math.random() * names.length)]
                });
            });
        } else {
            res.json({ error: true, message: 'Upload thất bại gòi, mọi người nhớ chọn đúng file excel (ích xeo nhoa).' });
        }
    } catch (error) {
        res.json({ error: true, message: `Upload thất bại rồi, mọi người nhớ chọn file nha nha. (Code - ${error})` });
    }
});

app.get('/', (req, res) => {
    // const { processedData, dateSent, dateReceive, totalDon } = taoDanhSach();
    processedData = {};
    dateSent = '';
    dateReceive = '';
    totalDon = '';
    res.render('table', { data: processedData, dateSent, dateReceive, totalDon });
});

app.post('/', (req, res) => {
    try {
        const { filename } = req.body;
        let processedData, dateSent, dateReceive, totalDon;
        ({ processedData, dateSent, dateReceive, totalDon } = taoDanhSachCuaMotNgay(path.join('uploads', filename)));

        // kiem tra xem co undefined hay khong
        let isHaveUndefinedData = processedData.some(item => {
            return Object.values(item).some(value => value === undefined);
        });

        if (isHaveUndefinedData) {
            ({ processedData, dateSent, dateReceive, totalDon } = taoDanhSachCuaNhieuNgay(path.join('uploads', filename)));
        }

        res.json({ error: false, data: processedData, dateSent, dateReceive, totalDon, message: 'Yeah danh sách tạo rồi nè copy vô file excel thôiii' });
    } catch (error) {
        console.log(`🚀 🚀 file: index.js:219 🚀 app.post 🚀 error`, error);
        res.json({ error: true, message: `Tạo danh sách thất bại gòi, mọi người coi lại tên file đúng chưa nhaa nhaa (Code - ${error})` });
    }
});

app.get('/huong-dan-su-dung', (req, res) => {
    res.render('tutorial');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/lich-su', async (req, res) => {
    let history = await readArrayFromFile();
    res.render('history', { history });
});

app.get('/version', async (req, res) => {
    res.render('version');
});

app.use(function (req, res) {
    res.status(404).render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('500');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
