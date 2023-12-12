const mongoose = require("mongoose");
const moment = require("moment");

const { MOMENT_FORMAT } = require("../constants");

const ngayLamSchema = new mongoose.Schema(
    {
        ngayLam: { type: Date, required: true, default: Date.now },
        nguoiLam: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        gioBuoiSang: { type: Number, default: 0 },
        gioBuoiChieu: { type: Number, default: 0 },
        gioLamThem: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
);

const NgayLam = mongoose.model("NgayLam", ngayLamSchema);

module.exports = NgayLam;
