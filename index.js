const express = require('express');
const xlsx = require('xlsx');
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const {
    removeOldFiles,
    taoDanhSach,
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

        if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            console.log(req.file);

            let oldPath = req.file.path;
            let newPath = path.join(path.dirname(oldPath), 'DS_NopDon_' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + '.xlsx');
            let filename = path.basename(newPath);

            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    res.json({ error: true, message: `File rename failed: ${err}` });
                } else {
                    console.log(req.file);
                    res.json({ error: false, message: `File uploaded and renamed successfully ${filename}`, filename });
                }
            });
        } else {
            res.json({ error: true, message: 'Upload failed: not a correct file' });
        }
    } catch (error) {
        res.json({ error: true, message: `Upload failed ${error}` });
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
        const { processedData, dateSent, dateReceive, totalDon } = taoDanhSach(path.join('uploads', filename));

        res.json({ error: false, data: processedData, dateSent, dateReceive, totalDon, message: 'Yeah danh sách tạo rồi nè copy vô file excel thôiii' });
    } catch (error) {
        console.log(`🚀 🚀 file: index.js:219 🚀 app.post 🚀 error`, error);
        res.json({ error: true, message: `Create Danh Sach Fail ${error}` });
    }
});

app.get('/huong-dan-su-dung', (req, res) => {
    res.render('tutorial');
});

app.get('/about', (req, res) => {
    res.render('about');
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
