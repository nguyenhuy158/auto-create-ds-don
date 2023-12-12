// create router file in nodejs

const moment = require("moment");
const XLSX = require("xlsx");

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
        let { start, end } = req.query;

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

router.get('/events/excel', async (req, res) => {
    try {
        let { start, end } = req.query;

        if (!start || !end) {
            const currentMonthStart = moment().startOf('month');
            const currentMonthEnd = moment().endOf('month');
            start = start || currentMonthStart;
            end = end || currentMonthEnd;
        }

        let events = await NgayLam.find({
            ngayLam: {
                $gte: start,
                $lte: end,
            }
        }).populate('nguoiLam');

        let formattedEvents = events.map(event => {
            // Destructure the event object and exclude _id and __v properties
            const {
                _id,
                __v,
                nguoiLam,
                ...rest
            } = event.toObject();

            // Format the event and exclude _id and __v properties
            return {
                start: moment(event.ngayLam).format(MOMENT_FORMAT),
                end: moment(event.ngayLam).format(MOMENT_FORMAT),
                nguoiLam: event.nguoiLam?.fullName || event.nguoiLam.username,
                ...rest,
            };
        });

        // all day in month
        // Get the current month
        const daysInMonth = moment().daysInMonth();
        // Create an array of objects for each day in the current month
        const arrayOfObjects = Array.from({ length: daysInMonth }, (_, index) => {
            const currentDay = index + 1;
            const date = moment().clone().date(currentDay);

            return {
                date: date.format('YYYY-MM-DD'),
                text: date.format('DD'),
            };
        });

        console.log(arrayOfObjects);
        console.log(`🚀 🚀 file: cham-cong.js:139 🚀 router.get 🚀 formattedEvents`, formattedEvents);

        var ws = XLSX.utils.json_to_sheet(formattedEvents);
        var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Data");
        var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        res.attachment("SheetJSExpress.xlsx");
        res.status(200).end(buf);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/bang-cham-cong', async (req, res) => {
    try {
        const ngayLam = await NgayLam.find();

        return res.status(200).render('bang-cham-cong', {
            ngayLam
        });
    } catch (error) {
        console.log('error:115 ', error);
        return res.redirect('/');
    }
});

module.exports = router;
