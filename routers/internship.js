// create router file in nodejs

const moment = require("moment");

const router = require("express").Router();
const User = require("../models/user");
const NgayLam = require("../models/ngay-lam");

const { MOMENT_FORMAT } = require("../constants");

router.use(async (req, res, next) => {
    next();
});

router.get("", async (req, res) => {
    return res.status(200).render("internship");
});

router.get("/list", async (req, res) => {
    const users = await User.find();

    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");

    const ngayLamObjects = await NgayLam.find({
        ngayLam: { $gte: startOfMonth, $lte: endOfMonth },
    });


    return res.json({
        data: users,
    });
});

module.exports = router;
