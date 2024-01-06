// create router file in nodejs
const router = require("express").Router();
const User = require("../models/user");

router.get("/dang-nhap", async (req, res) => {
    return res.status(200).render("dang-nhap", {});
});

router.post("/dang-nhap", async (req, res) => {
    const { username } = req.body;
    const { password } = req.body;

    const user = await User.findOne({ username });
    // console.log("existUser: ", user);

    if (!user) {
        return res.status(400).json({
            message: "Không tìm thấy tài khoản rồi :((",
        });
    }

    const isValid = await user.passwordValid(password);

    if (isValid) {

        req.session.user = user;

        return res.status(200).json({
            message: "Đăng nhập thành công :)",
        });
    }

    return res.status(400).json({
        message: "Sai thông gì nào đó gòiii :((",
    });
});

router.get("/register", async (req, res) => {
    return res.status(200).render("register", {});
});

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });

        // console.log("existingUser: ", existingUser);
        // console.log("username: ", username);
        // console.log("password: ", password);

        if (existingUser) {
            return res.status(400).json({
                message: "Tài khoản đã tồn tại rồi :((",
            });
        }

        // Create a new user instance and save it
        const newUser = new User({ username, password });
        await newUser.save();

        return res.status(200).json({
            message: "Tạo tài khoản thành công :))",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Có lỗi xảy ra khi tạo tài khoản.",
        });
    }
});

router.post('/dang-ky-internship', async (req, res) => {
    try {
        const { username, password, fullName } = req.body;

        if (!username) {
            return res.status(400).json({
                message: "Vui lòng điền tài khoảng.",
            });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: "Tài khoản đã tồn tại rồi :((",
            });
        }

        const newUser = new User({
            username,
            password: password || username,
            fullName,
            role: 'internship'
        });
        await newUser.save();

        return res.status(200).json({
            message: "Tạo tài khoản thành công :))",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Có lỗi xảy ra khi tạo tài khoản.",
        });
    }
});

router.get("/dang-xuat", async (req, res) => {
    req.session.destroy();
    req.app.locals.user = undefined;
    return res.redirect("/");
});

module.exports = router;
