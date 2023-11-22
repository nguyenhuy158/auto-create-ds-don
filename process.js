
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const moment = require('moment');

const {
    requestTypeToPerson,
    keepColumns,
    cacLoaiDonSeBiXoa
} = require('./constants');

function locRaCacCotCanThiet(obj) {
    Object.keys(obj)
        .filter(key => !keepColumns.includes(key))
        .forEach(key => delete obj[key]);
    return obj;
};

function thayDoiNguoiXuLyDonThanh1Nguoi(obj) {
    if (obj['Loại đơn (Tên đơn)'] in requestTypeToPerson) {
        obj['Người giải quyết đơn'] = requestTypeToPerson[obj['Loại đơn (Tên đơn)']];
    }
    return obj;
};

function createArrayOfObjects(sheet) {
    const jsonArray = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Extract headers from the first row
    const headers = jsonArray[0];

    // Remove the headers from the array
    const data = jsonArray.slice(1);

    // Convert each row to an object
    const arrayOfObjects = data.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });

    return arrayOfObjects;
};

function xoaCacDonNhuMienTaVaCapBangDiem(data, removeTypes) {
    const result = data.filter(obj => {
        const co_nam_trong_ds_don_bi_xoa_hay_khong = removeTypes.includes(obj['Loại đơn (Tên đơn)']);
        let keep = !co_nam_trong_ds_don_bi_xoa_hay_khong;
        if (obj['Loại đơn (Tên đơn)'] === removeTypes[0]) {
            keep = obj['Người giải quyết đơn'].includes('Phạm Thị Phương Trinh');
        }
        return keep;
    });
    return result;
    // return data.filter(obj => !(removeTypes.includes(obj['Loại đơn (Tên đơn)']) && (obj['MSSV'].charAt(3) === 'H' || obj['MSSV'].charAt(3) === '0')));
};

exports.taoDanhSach = function taoDanhSach(filename = 'DS_NopDon.xlsx') {
    // Read the Excel file
    const workbook = xlsx.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    let processedData = createArrayOfObjects(sheet);

    processedData.forEach(obj => locRaCacCotCanThiet(obj));

    processedData = xoaCacDonNhuMienTaVaCapBangDiem(processedData, cacLoaiDonSeBiXoa);

    processedData.forEach(obj => thayDoiNguoiXuLyDonThanh1Nguoi(obj));

    // Sap xep lai thu tu theo nguoi giai quyet don
    processedData.sort((a, b) => {
        if (a['Người giải quyết đơn'] < b['Người giải quyết đơn']) {
            return -1;
        }
        if (a['Người giải quyết đơn'] > b['Người giải quyết đơn']) {
            return 1;
        }
        return 0;
    });

    // Tao ra dong trong de tao khoang cach giua cac nguoi giai quyet don
    const emptyObj = Object.fromEntries(Object.keys(processedData[0]).map(key => [key, '']));

    // Them dong trong vao giua cac nguoi giai quyet don
    let prevPerson = null;
    for (let i = 0; i < processedData.length; i++) {
        if (prevPerson !== null && processedData[i]['Người giải quyết đơn'] !== prevPerson) {
            processedData.splice(i, 0, { ...emptyObj });
            i++;
        }
        prevPerson = processedData[i]['Người giải quyết đơn'];
    }

    // Them dong trong vao dau tien
    processedData.unshift(emptyObj);

    // Them thong tin loai don va nguoi giai quyet don vao dong trong
    for (let i = 0; i < processedData.length - 1; i++) {
        if (JSON.stringify(processedData[i]) === JSON.stringify(emptyObj)) {
            processedData[i] = {
                'Người giải quyết đơn': processedData[i + 1]['Người giải quyết đơn'],
                'Loại đơn (Tên đơn)': processedData[i + 1]['Loại đơn (Tên đơn)'],
            };
        }
    }

    // Xoa nguoi giai quyet don o cac dong binh thuong
    for (let i = 0; i < processedData.length; i++) {
        if (Object.keys(processedData[i]).length === 5) {
            processedData[i]['Người giải quyết đơn'] = '';
        }
    }

    // Danh so thu tu lai 
    let stt = 1;
    prevPerson = null;
    for (let i = 0; i < processedData.length; i++) {
        if (processedData[i]['Người giải quyết đơn'] !== prevPerson) {
            stt = 1;
        }
        if (Object.keys(processedData[i]).length > 2) {
            processedData[i]['STT'] = stt++;
        }
        prevPerson = processedData[i]['Người giải quyết đơn'];
    }

    // Them thong loai don va nguoi giai quyet
    let prevType = null;
    for (let i = 0; i < processedData.length; i++) {
        if (Object.keys(processedData[i]).length === 2) {
            prevType = processedData[i]['Loại đơn (Tên đơn)'];
            continue;
        }
        if (processedData[i]['Loại đơn (Tên đơn)'] !== prevType) {
            const newObj = {
                'Người giải quyết đơn': processedData[i]['Người giải quyết đơn'],
                'Loại đơn (Tên đơn)': processedData[i]['Loại đơn (Tên đơn)'],
            };
            processedData.splice(i, 0, newObj);
            i++;
        }
        prevType = processedData[i]['Loại đơn (Tên đơn)'];
    }

    // Hien thi du lieu
    // console.log(`🚀 🚀 file: index.js:79 🚀 app.get 🚀 processedData`, processedData);

    // Tinh tong so don
    let totalDon = processedData.filter(obj => Object.keys(obj).length === 6).length;
    // Ngay giai don
    let dateSent = moment().add(1, 'days').format('DD/MM/YYYY');
    // Ngay nhan don
    let dateReceive = moment().format('DD [tháng] MM [năm] YYYY');
    dateReceive = 'Tp. Hồ Chí Minh, ngày ' + dateReceive;

    // Gui du lieu ve cho client
    return { processedData, dateSent, dateReceive, totalDon };
};

exports.removeOldFiles = function removeOldFiles(directoryPath = 'uploads/') {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.log(`🚀 🚀 file: index.js:64 🚀 fs.readdir 🚀 err`, err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directoryPath, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.log(`🚀 🚀 file: index.js:71 🚀 fs.stat 🚀 err`, err);
                    return;
                }

                const now = moment();
                const fileTime = moment(stats.mtime);
                const diffMinutes = now.diff(fileTime, 'minutes');

                if (diffMinutes > 60 * 24 * 2) {
                    fs.unlink(filePath, err => {
                        if (err) throw err;
                        console.log(`Deleted file: ${filePath}`);
                    });
                }
            });
        });
    });
};