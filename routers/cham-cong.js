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
        ngayLam = moment(ngayLam, 'DD/MM/YYYY');
        console.log(`ngayLam: `, ngayLam);
        console.log(`ngayLam: `, ngayLam.day());

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

        const existNgayLamModel = await NgayLam.findOne({ ngayLam: ngayLam.toDate(), nguoiLam });
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

router.get('/events', async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            const currentMonthStart = moment().startOf('month');
            const currentMonthEnd = moment().endOf('month');
            start = start || currentMonthStart;
            end = end || currentMonthEnd;
        }


        const events = await NgayLam.find({
            ngayLam: {
                $gte: start,
                $lte: end,
            }
        }).populate('nguoiLam');

        const formattedEvents = events.map(event => ({
            id: event._id,
            title: `${event.nguoiLam?.fullName || event.nguoiLam.username}`,
            start: moment(event.ngayLam).format(MOMENT_FORMAT),
            end: moment(event.ngayLam).format(MOMENT_FORMAT),
        }));

        res.status(200).json(formattedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
