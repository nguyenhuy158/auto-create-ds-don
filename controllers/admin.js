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

exports.hienThiTrangDoiMatKhau = async (req, res) => {
    return res.render("doi-mat-khau");
};

exports.doiMatKhau = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // console.log('oldPassword', oldPassword);
        // console.log('newPassword', newPassword);
        // console.log('confirmPassword', confirmPassword);

        
        const userId = req.session.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "Không tìm thấy user này đao.",
            });
        }

        if (!user.passwordValid(oldPassword)) {
            return res.status(400).json({
                message: "Mật khẩu cũ không đúng.",
            });
        }
        
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            message: "Thay đổi mật khẩu thành công.",
            success: true,
        });
    } catch (error) {
        return res.status(400).json({
            message: `Lỗi mất tiêu. [code: ${error}]`,
        });
    }
};
