const express = require("express");
const path = require("path");
const multer = require("multer");
const session = require("express-session");

const chamCongRouter = require("./routers/cham-cong");
const internshipRouter = require("./routers/internship");
const authRouter = require("./routers/auth");
const adminRouter = require("./routers/admin");
const otherRouter = require("./routers/other");
const errorRouter = require("./routers/error");
const mongoose = require("./database");


const {
    downloadFile,
    uploadFile,
} = require("./utils");

const upload = multer({ dest: "uploads/" });

const {
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
app.post("/upload", upload.single("file"), uploadFile);

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
