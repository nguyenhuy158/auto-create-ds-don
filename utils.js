const fsPromises = require('fs').promises;
const XLSX = require("xlsx");
const path = require("path");
const moment = require("moment");
const fs = require("fs");

const {
    removeOldFiles,
} = require("./process");

const {
    taoDanhSachCuaMotNgay,
    taoDanhSachCuaNhieuNgay
} = require("./process");

const { names } = require("./constants");

exports.readArrayFromFile = async function readArrayFromFile(filePath = './data.json') {
    try {
        const fileContent = await fsPromises.readFile(filePath, 'utf-8');
        const dataArray = JSON.parse(fileContent);
        return dataArray;
    } catch (error) {
        console.error('Error reading file:', error.message);
        if (error.code === 'ENOENT') {
            await fsPromises.writeFile(filePath, '[]', 'utf-8');
        }
        return [];
    }
};

async function writeArrayToFile(data, filePath = './data.json') {
    try {
        const currentData = await exports.readArrayFromFile();
        const dataArray = [data, ...currentData];
        const jsonString = JSON.stringify(dataArray, null, 2);
        await fsPromises.writeFile(filePath, jsonString, 'utf-8');
        console.log(`Data successfully written to ${filePath}`);
    } catch (error) {
        console.error('Error writing to file:', error.message);
        return;
    }
};

exports.downloadFile = (req, res) => {
    try {
        let aoa = req.body.aoa;
        // replace null to empty string in aoa array of array
        aoa = aoa.replace(/null/g, '""');

        // replace empty string to null in aoa array of array
        aoa = aoa.replace(/""/g, "null");

        // parse aoa to array of array
        aoa = JSON.parse(aoa);

        // create worksheet
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
        ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });
        ws["!merges"].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 5 } });
        ws["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 5 } });
        ws["!merges"].push({ s: { r: aoa.length - 1, c: 2 }, e: { r: aoa.length - 1, c: 5 } });
        ws["!merges"].push({ s: { r: aoa.length - 2, c: 2 }, e: { r: aoa.length - 2, c: 5 } });
        ws["!merges"].push({ s: { r: aoa.length - 3, c: 2 }, e: { r: aoa.length - 3, c: 5 } });
        ws["!merges"].push({ s: { r: aoa.length - 4, c: 2 }, e: { r: aoa.length - 4, c: 5 } });
        ws["!merges"].push({ s: { r: aoa.length - 5, c: 2 }, e: { r: aoa.length - 5, c: 5 } });
        ws["!merges"].push({ s: { r: aoa.length - 6, c: 0 }, e: { r: aoa.length - 6, c: 2 } });

        for (let index = 5; index < aoa.length - 7; index++) {
            let item = aoa[index];
            // console.log(`🚀 item`, item);
            if (item[1] == undefined && item[2] == undefined && item[3] == undefined) {
                // console.log(`🚀 🚀 file: app.js:148 🚀 app.post 🚀 item[1] == '' && item[2] == '' && item[3] == ''`, item[1] == '' && item[2] == '' && item[3] == '');
                // console.log(`🚀 🚀 file: app.js:149 🚀 app.post 🚀 { s: { r: index, c: 0 }, e: { r: index, c: 3 } }`, { s: { r: index, c: 0 }, e: { r: index, c: 3 } });
                ws["!merges"].push({ s: { r: index, c: 0 }, e: { r: index, c: 3 } });
            }
        }

        // create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Table");

        // Send the Excel file as a response
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=DS_Don.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.status(200).end(buf);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

exports.uploadFile = (req, res) => {
    try {
        removeOldFiles();

        if (req.file.originalname.endsWith(".xlsx") || req.file.originalname.endsWith(".xls")) {
            console.log(req.file);

            let oldPath = req.file.path;
            let newPath = path.join(
                path.dirname(oldPath),
                "DS_NopDon_" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + ".xlsx",
            );
            let filename = path.basename(newPath);

            fs.rename(oldPath, newPath, async (error) => {
                if (error) {
                    res.json({ error: true, message: `Đổi tên file thất bại: (Code - ${error})` });
                } else {
                    console.log(req.file);
                    res.json({ error: false, message: `Tải file lên thành công ${filename}`, filename });
                }
                await writeArrayToFile({
                    filename,
                    date: moment().format("DD/MM/YYYY HH:mm"),
                    name: names[Math.floor(Math.random() * names.length)],
                });
            });
        } else {
            res.json({
                error: true,
                message: "Tải lên thất bại gòi, nhớ chọn đúng file excel.",
            });
        }
    } catch (error) {
        res.json({ error: true, message: `Tải lên thất bại, nhớ chọn file excel nha. (Code - ${error})` });
    }
};


exports.createTable = (req, res) => {
    try {
        const { filename } = req.body;
        let processedData, dateSent, dateReceive, totalDon;
        ({ processedData, dateSent, dateReceive, totalDon } = taoDanhSachCuaMotNgay(
            path.join("uploads", filename),
            true,
        ));

        // kiem tra xem co undefined hay khong
        let isHaveUndefinedData = processedData.some((item) => {
            return Object.values(item).some((value) => value === undefined);
        });

        if (isHaveUndefinedData) {
            ({ processedData, dateSent, dateReceive, totalDon } = taoDanhSachCuaNhieuNgay(
                path.join("uploads", filename),
                true,
            ));
        }

        res.json({
            error: false,
            data: processedData,
            dateSent,
            dateReceive,
            totalDon,
            message: "Tạo danh sách thành công",
        });
    } catch (error) {
        console.log(`error:219:`, error);
        res.json({
            error: true,
            message: `Tạo danh sách thất bại, tải file lên và thử lại (Code - ${error})`,
        });
    }
};