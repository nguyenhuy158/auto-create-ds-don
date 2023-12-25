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
        ngayLam = moment(ngayLam, "DD/MM/YYYY").endOf('day');

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
        if (existNgayLamModel) {
            return res.status(400).json({
                message: `Đã được chấm công ngày ${moment(ngayLam).format(
                    MOMENT_FORMAT,
                )} rồi (nếu cần có thể chỉnh sửa lại nha không tạo mới được đao)`,
            });
        }
        const ngayLamModel = new NgayLam({
            ngayLam: ngayLam,
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

router.get("/events/excel", async (req, res) => {
    try {
        let { start, end } = req.query;

        if (!start || !end) {
            const currentMonthStart = moment().startOf('month');
            const currentMonthEnd = moment().endOf('month');
            start = start || currentMonthStart;
            end = end || currentMonthEnd;
        }

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

        console.log('result:', result);
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

        console.log('transformedData:', transformedData);
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
                table[person.fullName].morning[item._id - 1] += person.morning != 0 ? 1 : 0;
                table[person.fullName].afternoon[item._id - 1] += person.afternoon != 0 ? 1 : 0;
                table[person.fullName].bonus[item._id - 1] += person.bonus + person.morning + person.afternoon;
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











        // aoa

        console.log('aoa:', aoa);

        // 
        // remove T7 & CN
        let rowHeader = aoa[0];
        rowHeader.forEach((item, column) => {
            let day = item;
            let currentDate = moment().date(day);

            if (currentDate.day() == 0) {
                // console.log(`🚀 currentDate`, currentDate.format('DD/MM/YYYY'));
                // CN
                aoa.forEach((person, row) => {
                    if (row > 0 && aoa[row][1] != 'bonus') {
                        aoa[row][column] = 'x';
                    }
                });
            }

            if (currentDate.day() == 6) {
                // T7
                // console.log(`🚀 currentDate`, currentDate.format('DD/MM/YYYY'));
                aoa.forEach((person, row) => {
                    if (row > 0 && aoa[row][1] != 'bonus') {
                        aoa[row][column] = 'x';
                    }
                });
            }
        });


        function calculateTotalBonus(personData) {
            // Starting from the 3rd element (index 2) to exclude "nguoiLam" and "Shift"
            if (personData[1] != 'bonus') {
                return 0;
            }
            let totalBonus = personData.slice(2).reduce((sum, bonus) => sum + (+bonus), 0);

            personData.forEach((bonus, index) => {
                // personData[index] = bonus == 0 ? "" : bonus;
                if (index > 1) {
                    personData[index] = 0;
                }
            });
            return totalBonus;
        }
        aoa.forEach((person, index) => {
            // Calculate the total bonus for the person
            let totalBonus = calculateTotalBonus(person);

            // nếu giờ dư lớn hơn 0 thì thêm vào
            console.log(`🚀 🚀 file: cham-cong.js:300 🚀 aoa.forEach 🚀 totalBonus > 0`, totalBonus, totalBonus > 0);
            if (totalBonus > 0) {
                let rowAbove = aoa[index - 1];
                // console.log(`🚀 🚀 file: cham-cong.js:301 🚀 aoa.forEach 🚀 rowAbove`, rowAbove);
                let rowDoubleAbove = aoa[index - 2];
                // console.log(`🚀 🚀 file: cham-cong.js:303 🚀 aoa.forEach 🚀 rowDoubleAbove`, rowDoubleAbove);


                let buoiThem = Math.floor(totalBonus / 180);
                totalBonus = totalBonus % 180;

                for (let i = 0; i < buoiThem; i++) {
                    let used = false;
                    for (let j = 2; j < rowAbove.length; j++) {
                        if (rowAbove[j] == 0 && rowAbove[j] != 180) {
                            rowAbove[j] = 1;
                            console.log('rowAbove', j, rowAbove);
                            used = true;
                            break;
                        }

                        if (rowDoubleAbove[j] == 0 && rowDoubleAbove[j] != 180) {
                            rowDoubleAbove[j] = 1;
                            console.log('rowDoubleAbove', j, rowDoubleAbove);
                            used = true;
                            break;
                        }
                    }

                    if (!used) {
                        totalBonus = totalBonus + 180;
                    }
                }

            }

            // Add a new property "bonusTotal" with the calculated total bonus
            person.push(totalBonus);
        });

        for (let i = 0; i < aoa.length; i++) {
            const row = aoa[i];
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];
                if (cell == 'x') {
                    aoa[i][j] = '';
                }
            }
        }

        // xoa dong bonus
        for (let i = 0; i < aoa.length; i++) {
            const row = aoa[i];
            if (row[1] == 'bonus') {
                aoa.splice(i, 1);
                i--;
            }
        }

        // them cot tong o cuoi
        aoa[0].push('Tổng');
        for (let i = 1; i < aoa.length; i++) {
            const row = aoa[i];
            let total = 0;
            for (let j = 2; j < row.length; j++) {
                const cell = row[j];
                total += +cell;
            }
            aoa[i].push(total);
        }



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
