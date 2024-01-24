
const session = require("express-session");

exports.useSession = session({
    secret: "E0001",
    resave: false,
    saveUninitialized: true,
});

exports.getTrangChu = (req, res) => {
    processedData = {};
    dateSent = "";
    dateReceive = "";
    totalDon = "";
    res.render("table", { data: processedData, dateSent, dateReceive, totalDon });
};

exports.getHuongDan = (req, res) => {
    res.render("huong-dan");
};

exports.getGioiThieu = (req, res) => {
    res.render("gioi-thieu");
};

exports.getLichSu = async (req, res) => {
    let history = await readArrayFromFile();
    res.render("lich-su", { history });
};

exports.getPhienBan = async (req, res) => {
    res.render("phien-ban");
};



