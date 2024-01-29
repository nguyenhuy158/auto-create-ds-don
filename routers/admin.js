
const router = require("express").Router();
const adminController = require("../controllers/admin");

router.post("/cap-nhat-thong-tin", adminController.capNhatThongTin);

router.post("/xoa-thong-tin", adminController.xoaThongTin);

router.post("/doi-mat-khau", adminController.doiMatKhau);

router.get("/doi-mat-khau", adminController.hienThiTrangDoiMatKhau);

router.post("/doi-thong-tin-ca-nhan", adminController.doiThongTinCaNhan);

router.get("/doi-thong-tin-ca-nhan", adminController.hienThiTrangDoiThongTinCaNhan);


module.exports = router;
