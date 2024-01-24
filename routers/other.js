const router = require("express").Router();
const { readArrayFromFile, writeArrayToFile } = require("../utils");

router.get("/huong-dan-su-dung", (req, res) => {
    res.render("tutorial");
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
