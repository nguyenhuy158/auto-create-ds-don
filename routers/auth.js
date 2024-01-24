
const router = require("express").Router();
const User = require("../models/user");
const authController = require("../controllers/auth");

router.get("/dang-nhap", authController.dangNhap);

router.post("/dang-nhap", authController.dangNhapPost);

router.get("/register", authController.dangKy);

router.post("/register", authController.dangKyPost);

router.post('/dang-ky-internship', authController.dangKyInternship);

router.get("/dang-xuat", authController.dangXuat);

router.use(authController.updateUser);

module.exports = router;
