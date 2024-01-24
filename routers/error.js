const router = require("express").Router();
const errorController = require("../controllers/error");

router.use(errorController.error404);

router.use(errorController.error500);

module.exports = router;
