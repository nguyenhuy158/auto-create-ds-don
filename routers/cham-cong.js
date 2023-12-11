// create router file in nodejs

const moment = require("moment");

const router = require("express").Router();
const User = require("../models/user");
const NgayLam = require("../models/ngay-lam");

const { MOMENT_FORMAT } = require("../constants");

router.use(async (req, res, next) => {
    // const newUser = new User({ username: 'admin', password: 'admin' });
    // newUser.save();
    next();
});

router.get("", async (req, res) => {
    const users = await User.find();
    return res.status(200).render("cham-cong", {
        users,
    });
});

router.post("", async (req, res) => {
    try {
        let { ngayLam } = req.body;
        let { gioBuoiSang } = req.body;
        let { gioBuoiChieu } = req.body;
        let { gioLamThem } = req.body;
        let { nguoiLam } = req.body;

        // nguoiLam = await User.findById(nguoiLam);
        ngayLam = moment(ngayLam, MOMENT_FORMAT).toDate();

        if (ngayLam.day() == 0) {
            return res.status(400).json({
                message: `Không chấm công vào ngày CN được đao`,
            });
        }

        if (ngayLam.day() == 6) {
            return res.status(400).json({
                message: `Không chấm công vào ngày T7 được đao`,
            });
        }

        const existNgayLamModel = await NgayLam.findOne({ ngayLam, nguoiLam });
        console.log("existNgayLamModel: ", existNgayLamModel);
        if (existNgayLamModel) {
            return res.status(400).json({
                message: `Đã được chấm công ngày ${moment(ngayLam).format(
                    MOMENT_FORMAT,
                )} rồi (nếu cần có thể chỉnh sửa lại nha không tạo mới được đao)`,
            });
        }
        const ngayLamModel = new NgayLam({
            ngayLam,
            gioBuoiSang,
            gioBuoiChieu,
            gioLamThem,
            nguoiLam,
        });

        await ngayLamModel.save();

        return res.status(200).json({
            message: "Thêm dữ liệu thành công",
        });
    } catch (error) {
        return res.status(500).json({
            message: `Lỗi từ hệ thống. Vui lòng thử lại sau. [code: ${error}]`,
        });
    }
});

module.exports = router;
