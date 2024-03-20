const session = require("express-session");
const router = require("express").Router();

const otherController = require("../controllers/other");

router.use(otherController.useSession);

router.get("/", otherController.getTrangChu);

router.get("/huong-dan-su-dung", otherController.getHuongDan);

router.get("/gioi-thieu", otherController.getGioiThieu);

router.get("/lich-su", otherController.getLichSu);

router.get("/phien-ban", otherController.getPhienBan);

module.exports = router;


