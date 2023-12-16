// create router file in nodejs

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
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
    let users;
    if (req.session.user.role === "admin") {
        users = await User.find({ role: "internship" });
        // console.log("users: ", users);
    }
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

        let tongGio = +gioBuoiSang + +gioBuoiChieu + +gioLamThem;

        // nguoiLam = await User.findById(nguoiLam);
        ngayLam = moment(ngayLam, "DD/MM/YYYY");

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
            tongGio,
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

router.get("/events", async (req, res) => {
    try {
        let { start, end } = req.query;

        if (!start || !end) {
            const currentMonthStart = moment().startOf("month");
            const currentMonthEnd = moment().endOf("month");
            start = start || currentMonthStart;
            end = end || currentMonthEnd;
        }

        const events = await NgayLam.find({
            ngayLam: {
                $gte: start,
                $lte: end,
            },
        }).populate("nguoiLam");

        const formattedEvents = events.map((event) => ({
            id: event._id,
            title: `${event.nguoiLam?.fullName || event.nguoiLam?.username}`,
            start: moment(event.ngayLam).format(MOMENT_FORMAT),
            end: moment(event.ngayLam).format(MOMENT_FORMAT),
        }));

        res.status(200).json(formattedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/events/:id", async (req, res, next) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return next();
    }
    try {
        const event = await NgayLam.findById(id).populate("nguoiLam");

        res.status(200).json({
            data: event,
            message: "Lấy dữ liệu thành công",
        });
    } catch (error) {
        res.status(500).send(`Đã có lỗi xảy ra [code: ${error}]`);
    }
});

router.get("/events/excel", async (req, res) => {
    try {
        const result = await NgayLam.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%d",
                            date: "$ngayLam",
                        },
                    },
                    count: { $sum: 1 },
                    nguoiLam: { $push: "$$ROOT" },
                },
            },
            {
                $unwind: "$nguoiLam",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "nguoiLam.nguoiLam",
                    foreignField: "_id",
                    as: "ChiTietNguoiLam",
                },
            },
            {
                $unwind: "$ChiTietNguoiLam",
            },
            {
                $group: {
                    _id: "$_id",
                    count: { $first: "$count" },
                    nguoiLam: {
                        $push: {
                            gioBuoiSang: "$nguoiLam.gioBuoiSang",
                            gioBuoiChieu: "$nguoiLam.gioBuoiChieu",
                            gioLamThem: "$nguoiLam.gioLamThem",
                            fullName: "$ChiTietNguoiLam.fullName",
                        },
                    },
                },
            },
        ]).exec();

        console.log(result);
        // Data transformation
        const transformedData = result.map((item) => {
            const nguoiLam = item.nguoiLam.map((person) => ({
                fullName: person.fullName,
                morning: person.gioBuoiSang,
                afternoon: person.gioBuoiChieu,
                bonus: person.gioLamThem,
            }));
            return {
                _id: item._id,
                count: item.count,
                nguoiLam: nguoiLam,
            };
        });

        // Create table structure
        const table = {};
        transformedData.forEach((item) => {
            item.nguoiLam.forEach((person) => {
                if (!table[person.fullName]) {
                    table[person.fullName] = {
                        morning: Array(31).fill(0),
                        afternoon: Array(31).fill(0),
                        bonus: Array(31).fill(0),
                    };
                }
                table[person.fullName].morning[item._id - 1] += person.morning;
                table[person.fullName].afternoon[item._id - 1] += person.afternoon;
                table[person.fullName].bonus[item._id - 1] += person.bonus;
            });
        });

        // Convert the table to an array of arrays (AOA)
        const aoa = [];

        // Header row
        const headerRow = ["nguoiLam", "Shift", ...Array.from({ length: 31 }, (_, i) => i + 1)];
        aoa.push(headerRow);

        // Data rows
        Object.entries(table).forEach(([fullName, values]) => {
            aoa.push([fullName, "morning", ...values.morning]);
            aoa.push([fullName, "afternoon", ...values.afternoon]);
            aoa.push([fullName, "bonus", ...values.bonus]);
        });

        // Create Excel workbook and sheet
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Table");

        // Send the Excel file as a response
        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        res.attachment("SheetJSExpress.xlsx");
        res.status(200).end(buf);
    } catch (error) {
        console.error(error);
        res.json({
            message: error.message,
        });
    }
});

router.get("/bang-cham-cong", async (req, res) => {
    try {
        const ngayLam = await NgayLam.find();

        return res.status(200).render("bang-cham-cong", {
            ngayLam,
        });
    } catch (error) {
        console.log("error:115 ", error);
        return res.redirect("/");
    }
});

module.exports = router;
