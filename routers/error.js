const router = require("express").Router();

router.use(function (req, res) {
    res.status(404).render("404");
});

router.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("500");
});

module.exports = router;
