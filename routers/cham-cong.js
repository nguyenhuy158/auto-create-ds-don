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

/**
 * lấy danh sách người làm
 * @returns {array} - danh sách người làm
 */
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

/**
 * tạo mới ngày làm
 * @param {string} ngayLam - ngày làm
 * @param {string} gioBuoiSang - giờ buổi sáng
 * @param {string} gioBuoiChieu - giờ buổi chiều
 * @param {string} gioLamThem - giờ làm thêm
 * @param {string} nguoiLam - người làm
 * @returns {object} - thông tin ngày làm
 * 
 */
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

/**
 * cập nhật thông tin ngày làm theo id
 * @param {string} id - id của ngày làm
 * @param {string} gioBuoiSang - giờ buổi sáng
 * @param {string} gioBuoiChieu - giờ buổi chiều
 * @param {string} gioLamThem - giờ làm thêm
 * @returns {object} - thông tin ngày làm
 * 
 */
router.put("", async (req, res, next) => {
    const id = req.body.id;
    if (!ObjectId.isValid(id)) {
        return next();
    }
    try {
        let { gioBuoiSang } = req.body;
        let { gioBuoiChieu } = req.body;
        let { gioLamThem } = req.body;
        let tongGio = +gioBuoiSang + +gioBuoiChieu + +gioLamThem;

        const event = await NgayLam.findById(id);
        event.gioBuoiSang = gioBuoiSang;
        event.gioBuoiChieu = gioBuoiChieu;
        event.gioLamThem = gioLamThem;
        event.tongGio = tongGio;

        // kiểm tra người dùng hiện tại đang login có phải admin
        // hoặc là người dùng đang login có phải là người làm
        // nếu không phải thì không cho xóa
        if (req.session.user.role !== "admin" &&
            req.session.user._id != event.nguoiLam) {
            return res.status(400).json({
                message: "Bạn không có quyền cập nhật ngày làm của người khác",
            });
        }

        await event.save();

        res.status(200).json({
            data: event,
            message: "Cập nhật dữ liệu thành công",
        });
    } catch (error) {
        res.status(500).send(`Đã có lỗi xảy ra [code: ${error}]`);
    }
});


/**
 * xóa ngày làm theo id
 * @param {string} id - id của ngày làm
 * @returns {object} - thông tin ngày làm
 */
router.delete("", async (req, res, next) => {
    const id = req.body.id;
    if (!ObjectId.isValid(id)) {
        return next();
    }
    try {

        // tìm kiếm ngày làm theo id
        const event = await NgayLam.findById(id);

        // kiểm tra ngày làm có tồn tại hay không
        if (!event) {
            return res.status(400).json({
                message: "Ngày làm không tồn tại",
            });
        }

        // kiểm tra người dùng hiện tại đang login có phải admin
        // hoặc là người dùng đang login có phải là người làm
        // nếu không phải thì không cho xóa
        if (req.session.user.role !== "admin" &&
            req.session.user._id != event.nguoiLam) {
            return res.status(400).json({
                message: "Bạn không có quyền xóa dữ liệu của người khác",
            });
        }

        // xóa ngày làm
        await NgayLam.deleteOne({ _id: id });

        res.status(200).json({
            data: event,
            message: "Xóa dữ liệu thành công",
        });
    } catch (error) {
        res.status(500).send(`Đã có lỗi xảy ra [code: ${error}]`);
    }
});

/**
 * lấy thông tin ngày làm theo id
 * @param {string} id - id của ngày làm
 * @returns {object} - thông tin ngày làm
 * @example
 * http://localhost:3000/cham-cong/events/5f9b1b9b9b9b9b9b9b9b9b9
 * @description
 * Nếu không có id thì trả về 404
 * Nếu id không hợp lệ thì trả về 404
 * Nếu không tìm thấy ngày làm thì trả về 404
 * Nếu tìm thấy ngày làm thì trả về thông tin ngày làm
 */
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

/**
 * lấy danh sách tất cả ngày làm
 * @param {string} start - ngày bắt đầu
 * @param {string} end - ngày kết thúc
 * @returns {array} - danh sách ngày làm
 * @example
 * http://localhost:3000/cham-cong/events?start=2021-01-01&end=2021-01-31
 * http://localhost:3000/cham-cong/events?start=2021-01-01
 * http://localhost:3000/cham-cong/events?end=2021-01-31
 * http://localhost:3000/cham-cong/events
 * @description
 * Nếu không có tham số start và end thì lấy danh sách ngày làm trong tháng hiện tại
 * Nếu chỉ có tham số start thì lấy danh sách ngày làm từ ngày start đến hết tháng
 * Nếu chỉ có tham số end thì lấy danh sách ngày làm từ đầu tháng đến ngày end
 * Nếu có cả start và end thì lấy danh sách ngày làm từ ngày start đến ngày end
 */
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
            title: `${event.nguoiLam?.fullName || event.nguoiLam?.username} [${event.tongGio}]`,
            start: moment(event.ngayLam).format(MOMENT_FORMAT),
            end: moment(event.ngayLam).format(MOMENT_FORMAT),
        }));

        res.status(200).json(formattedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// BẢNG CHẤM CÔNG //

/**
 * Tải file excel danh sách ngày làm
 * @param {string} start - ngày bắt đầu
 * @param {string} end - ngày kết thúc
 * @returns {file} - file excel danh sách ngày làm
 * @example
 * http://localhost:3000/cham-cong/events/excel?start=2021-01-01&end=2021-01-31
 * http://localhost:3000/cham-cong/events/excel?start=2021-01-01
 * http://localhost:3000/cham-cong/events/excel?end=2021-01-31
 * http://localhost:3000/cham-cong/events/excel
 * 
 */
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

        // console.log('result:', result);
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

        // console.log('transformedData:', transformedData);
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



        // them dong o hang cuoi sao cho bang tong cac gia tri o cot hien tai tru dong dau tien
        let rowLast = aoa[aoa.length - 1];
        let rowTotal = Array(rowLast.length).fill(0);
        rowTotal[0] = 'Tổng';
        rowTotal[1] = 'Tổng';
        for (let i = 2; i < rowLast.length; i++) {
            let total = 0;
            for (let j = 1; j < aoa.length; j++) {
                const row = aoa[j];

                // chi cong if row la so nguoc lai continue
                if (isNaN(row[i])) {
                    continue;
                }

                if (row[1] == 'bonus') {
                    continue;
                }

                total += +row[i];
            }
            const date = moment().date(aoa[0][i]);
            if (date.day() == 0) {
                // CN
                total = 99;
            }
            if (date.day() == 6) {
                // T7
                total = 99;
            }

            rowTotal[i] = total;
        }
        aoa.push(rowTotal);

        // aoa

        // console.log('aoa:', aoa);
        // console.log('rowTotal:', rowTotal);

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
        function updateTotalRow() {
            for (let i = 2; i < aoa[0].length - 1; i++) {
                let total = 0;
                for (let j = 1; j < aoa.length - 1; j++) {
                    const cellValue = aoa[j][i];
                    const row = aoa[j];

                    if (isNaN(row[i])) {
                        continue;
                    }

                    if (row[1] == 'bonus') {
                        continue;
                    }

                    total += +cellValue;
                }
                aoa[aoa.length - 1][i] = total;
            }
        }
        aoa.forEach((person, index) => {
            // Calculate the total bonus for the person
            let totalBonus = calculateTotalBonus(person);

            // nếu giờ dư lớn hơn 0 thì thêm vào
            // console.log(`🚀 🚀 file: cham-cong.js:300 🚀 aoa.forEach 🚀 totalBonus > 0`, totalBonus, totalBonus > 0);
            if (totalBonus > 0) {
                let rowAbove = aoa[index - 1];
                // console.log(`🚀 🚀 file: cham-cong.js:301 🚀 aoa.forEach 🚀 rowAbove`, rowAbove);
                let rowDoubleAbove = aoa[index - 2];
                // console.log(`🚀 🚀 file: cham-cong.js:303 🚀 aoa.forEach 🚀 rowDoubleAbove`, rowDoubleAbove);


                let buoiThem = Math.ceil(totalBonus / 180);
                totalBonus = totalBonus % 180;

                for (let i = 0; i < buoiThem; i++) {
                    let columnTotals = aoa[aoa.length - 1];
                    columnTotals = columnTotals.map((item, column) =>
                        isNaN(item) ||
                            moment().date(aoa[0][column]).day() == 6 ||
                            moment().date(aoa[0][column]).day() == 0 ||
                            (rowAbove[column] == 1 &&
                                rowDoubleAbove[column] == 1) ?
                            99 : item);
                    // console.log(`🚀 🚀 file: cham-cong.js:358 🚀 aoa.forEach 🚀 columnTotals`, columnTotals);
                    let used = false;
                    let minColumnIndex = columnTotals.indexOf(Math.min(...columnTotals.slice(2)));
                    // console.log(`🚀 🚀 file: cham-cong.js:363 🚀 aoa.forEach 🚀 minColumnIndex`, minColumnIndex);


                    for (let j = 2; j < rowAbove.length; j++) {
                        if (rowAbove[j] == 0 && rowAbove[j] != 180 && j === minColumnIndex) {
                            rowAbove[j] = 1;
                            // console.log('rowAbove', j, rowAbove);
                            used = true;
                            break;
                        }

                        if (rowDoubleAbove[j] == 0 && rowDoubleAbove[j] != 180 && j === minColumnIndex) {
                            rowDoubleAbove[j] = 1;
                            // console.log('rowDoubleAbove', j, rowDoubleAbove);
                            used = true;
                            break;
                        }
                    }

                    if (!used) {
                        totalBonus = totalBonus + 180;
                    }

                    updateTotalRow();
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
        // for (let i = 0; i < aoa.length; i++) {
        //     const row = aoa[i];
        //     if (row[1] == 'bonus') {
        //         aoa.splice(i, 1);
        //         i--;
        //     }
        // }

        // them cot tong o cuoi
        aoa[0].push('Tổng');
        for (let i = 1; i < aoa.length; i++) {
            const row = aoa[i];
            let total = 0;
            for (let j = 2; j < row.length; j++) {
                const cell = row[j];
                // if (isNaN(cell)) {
                //     continue;
                // }
                // if (cell == 'x') {
                //     continue;
                // }
                total += +cell;
            }
            aoa[i].push(total);
        }


        // update tong dong cuoi

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

/**
 * lấy trang bảng chấm công
 * @returns {object} - trang bảng chấm công
*/
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
