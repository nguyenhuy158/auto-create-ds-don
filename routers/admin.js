// create router file in nodejs
const router = require("express").Router();
const User = require("../models/user");

router.post("/cap-nhat-thong-tin", async (req, res) => {
    if (req.session.user.role !== "admin") {
        return res.status(400).json({
            message: "Bạn không được phép làm việc này đao."
        });
    }

    const { userId } = req.body;
    const { fullName } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({
            message: "Không tìm thấy user này đao."
        });
    }

    user.fullName = fullName;
    await user.save();

    return res.status(200).json({
        message: "Cập nhật thành công."
    });

});

module.exports = router;