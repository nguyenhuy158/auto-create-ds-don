const express = require("express");
const path = require("path");
const multer = require("multer");

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
    createTable,
} = require("./utils");

const upload = multer({ dest: "uploads/" });





// ==================== CONFIG ====================
const app = express();
const { PORT } = require('./constants');
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(otherRouter);
// ==================== CONFIG ====================





// ==================== TẠO BẢNG ====================
app.post("/upload", upload.single("file"), uploadFile);

app.post("/", createTable);

app.post("/download", downloadFile);
// ==================== TẠO BẢNG ====================





// ==================== CHẤM CÔNG ====================
app.use(authRouter);

app.use("/cham-cong", chamCongRouter);

app.use("/internship", internshipRouter);

app.use(adminRouter);
// ==================== CHẤM CÔNG ====================





app.use(errorRouter);
app.listen(PORT, () => {
    console.log(`[running] at http://localhost:${PORT}`);
});
