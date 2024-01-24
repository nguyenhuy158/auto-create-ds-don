const router = require("express").Router();
const { readArrayFromFile, writeArrayToFile } = require("../utils");

router.get("/huong-dan-su-dung", (req, res) => {
    res.render("tutorial");
});

router.get("/about", (req, res) => {
    res.render("about");
});

router.get("/lich-su", async (req, res) => {
    let history = await readArrayFromFile();
    res.render("history", { history });
});

router.get("/version", async (req, res) => {
    res.render("version");
});

module.exports = router;
