exports.error404 = function (req, res) {
    res.status(404).render("404");
};

exports.error500 = function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("500");
};
