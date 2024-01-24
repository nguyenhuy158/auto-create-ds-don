const session = require("express-session");
const router = require("express").Router();
const { readArrayFromFile } = require("../utils");

router.use(session({
    secret: "E0001",
    resave: false,
    saveUninitialized: true,
}));

router.get("/", (req, res) => {
    processedData = {};
    dateSent = "";
    dateReceive = "";
    totalDon = "";
    res.render("table", { data: processedData, dateSent, dateReceive, totalDon });
});

router.get("/huong-dan-su-dung", (req, res) => {
    res.render("huong-dan");
});

router.get("/gioi-thieu", (req, res) => {
    res.render("gioi-thieu");
});

router.get("/lich-su", async (req, res) => {
    let history = await readArrayFromFile();
    res.render("lich-su", { history });
});

router.get("/phien-ban", async (req, res) => {
    res.render("phien-ban");
});

module.exports = router;


