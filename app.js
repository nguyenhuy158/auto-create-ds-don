const express = require("express");
const xlsx = require("xlsx");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");
const XLSX = require("xlsx");

const chamCongRouter = require("./routers/cham-cong");
const internshipRouter = require("./routers/internship");
const authRouter = require("./routers/auth");
const adminRouter = require("./routers/admin");
const mongoose = require("./database");

const User = require("./models/user");
const NgayLam = require("./models/ngay-lam");

const { readArrayFromFile, writeArrayToFile } = require("./utils");
const { names } = require("./constants");

const upload = multer({ dest: "uploads/" });

const { removeOldFiles, taoDanhSachCuaMotNgay, taoDanhSachCuaNhieuNgay } = require("./process");

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "E0001",
        resave: false,
        saveUninitialized: true,
    }),
);

app.post("/upload", upload.single("file"), (req, res) => {
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

            fs.rename(oldPath, newPath, async (err) => {
                if (err) {
                    res.json({ error: true, message: `File rename failed: ${err}` });
                } else {
                    console.log(req.file);
                    res.json({ error: false, message: `File uploaded and renamed successfully ${filename}`, filename });
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
                message: "Upload thất bại gòi, mọi người nhớ chọn đúng file excel (ích xeo nhoa).",
            });
        }
    } catch (error) {
        res.json({ error: true, message: `Upload thất bại rồi, mọi người nhớ chọn file nha nha. (Code - ${error})` });
    }
});

app.get("/", (req, res) => {
    // const { processedData, dateSent, dateReceive, totalDon } = taoDanhSach();
    processedData = {};
    dateSent = "";
    dateReceive = "";
    totalDon = "";
    res.render("table", { data: processedData, dateSent, dateReceive, totalDon });
});

app.post("/", (req, res) => {
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
            message: "Yeah danh sách tạo rồi nè copy vô file excel thôiii",
        });
    } catch (error) {
        console.log(`error:219:`, error);
        res.json({
            error: true,
            message: `Tạo danh sách thất bại gòi, mọi người coi lại tên file đúng chưa nhaa nhaa (Code - ${error})`,
        });
    }
});

app.post("/download", (req, res) => {
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
});

app.get("/huong-dan-su-dung", (req, res) => {
    res.render("tutorial");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/lich-su", async (req, res) => {
    let history = await readArrayFromFile();
    res.render("history", { history });
});

app.get("/version", async (req, res) => {
    res.render("version");
});

app.use("", authRouter);
app.use((req, res, next) => {
    if (req.session.user) {
        res.app.locals.user = req.session.user;
        return next();
    }
    return res.redirect("/");
});

app.use("/cham-cong", chamCongRouter);

app.use("/internship", internshipRouter);

app.use(adminRouter);

app.use(function (req, res) {
    res.status(404).render("404");
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("500");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
