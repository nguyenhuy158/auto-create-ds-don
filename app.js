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
const otherRouter = require("./routers/other");
const errorRouter = require("./routers/error");
const mongoose = require("./database");

const User = require("./models/user");
const NgayLam = require("./models/ngay-lam");

const {
    readArrayFromFile,
    writeArrayToFile,
    downloadFile
} = require("./utils");
const { names } = require("./constants");

const upload = multer({ dest: "uploads/" });

const {
    removeOldFiles,
    taoDanhSachCuaMotNgay,
    taoDanhSachCuaNhieuNgay
} = require("./process");

const app = express();
const { PORT } = require('./constants');
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

/**
 * tải file excel lên
 * method: POST
 */
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

/**
 * trang chủ
 * chỉ hiển thị bảng rỗng
 * method: GET
 */
app.get("/", (req, res) => {
    // const { processedData, dateSent, dateReceive, totalDon } = taoDanhSach();
    processedData = {};
    dateSent = "";
    dateReceive = "";
    totalDon = "";
    res.render("table", { data: processedData, dateSent, dateReceive, totalDon });
});

/**
 * trang chủ luôn
 * hiển thị bảng đã được xử lý
 * method: POST
 */
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

/**
 * tải file excel xuống
 * method: POST
 */
app.post("/download", downloadFile);

app.use(otherRouter);

app.use(authRouter);

app.use("/cham-cong", chamCongRouter);

app.use("/internship", internshipRouter);

app.use(adminRouter);

app.use(errorRouter);

app.listen(PORT, () => {
    console.log(`[running] at http://localhost:${PORT}`);
});
