// create router file in nodejs
const router = require("express").Router();
const adminController = require("../controllers/admin");

router.post("/cap-nhat-thong-tin", adminController.capNhatThongTin);

router.post("/xoa-thong-tin", adminController.xoaThongTin);

router.post("/doi-mat-khau", adminController.doiMatKhau);

router.get("/doi-mat-khau", adminController.hienThiTrangDoiMatKhau);


module.exports = router;
