const User = require("../models/user");

exports.capNhatThongTin = async (req, res) => {
    const { userId } = req.body;

    if (req.session.user.role !== "admin" && req.session.user._id !== userId) {
        return res.status(400).json({
            message: "Bạn không có quyền làm việc này.",
        });
    }

    const { fullName } = req.body;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({
            message: "Không tìm thấy thông tin.",
        });
    }

    // just update if fullName or password is not null
    if (fullName) {
        user.fullName = fullName;
    }

    if (password) {
        user.password = password;
    }

    await user.save();

    return res.status(200).json({
        message: "Cập nhật thành công.",
    });
};

exports.xoaThongTin = async (req, res) => {
    try {
        if (req.session.user.role !== "admin") {
            return res.status(400).json({
                message: "Bạn không được phép làm việc này đao.",
            });
        }

        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "Không tìm thấy user này đao.",
            });
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            message: "Xóa thành công.",
        });
    } catch (error) {
        return res.status(400).json({
            message: `Lỗi mất tiêu. [code: ${error}]`,
        });
    }
};