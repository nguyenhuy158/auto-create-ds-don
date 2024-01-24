const fs = require('fs').promises;
const xlsx = require("xlsx");
const XLSX = require("xlsx");

exports.readArrayFromFile = async function readArrayFromFile(filePath = './data.json') {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const dataArray = JSON.parse(fileContent);
        return dataArray;
    } catch (error) {
        console.error('Error reading file:', error.message);
        if (error.code === 'ENOENT') {
            await fs.writeFile(filePath, '[]', 'utf-8');
        }
        return [];
    }
};

exports.writeArrayToFile = async function writeArrayToFile(data, filePath = './data.json') {
    try {
        const currentData = await exports.readArrayFromFile();
        const dataArray = [data, ...currentData];
        const jsonString = JSON.stringify(dataArray, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf-8');
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