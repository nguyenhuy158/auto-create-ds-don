
// port 
exports.PORT = 3000;

// loại đơn và người xử lý đơn tương ứng
exports.requestTypeToPerson = {
    // Ca Phú Phát
    "Đơn hoãn thi": "Ca Phú Phát",
    "Đăng ký dự thi": "Ca Phú Phát",
    "Đơn xin gỡ điểm F": "Ca Phú Phát",
    "Chuyển giờ thi": "Ca Phú Phát",
    "Đơn xin gỡ cấm thi": "Ca Phú Phát",

    // Ngô Thị Hoàng Phương
    "Cấp bản sao bằng tốt nghiệp": "Ngô Thị Hoàng Phương",

    // Đặng Phương Du
    "Đơn xin chuyển lớp": "Đặng Phương Du",
    "Đơn chuyển trường": "Đặng Phương Du",
    "Đơn xin chuyển ngành": "Đặng Phương Du",
    "Đơn đề nghị thôi học": "Đặng Phương Du",
    "Đơn xin cấp bảng điểm": "Đặng Phương Du",
    "Đơn nghỉ học tạm thời": "Đặng Phương Du",
    "Nhập học lại (sau khi nghỉ học tạm thời)": "Đặng Phương Du",

    // Nguyễn Thị Kim Tuyến
    "Đơn Đăng ký thi KNTHCM": "Nguyễn Thị Kim Tuyến",
    "Đơn xác nhận liên quan tốt nghiệp": "Nguyễn Thị Kim Tuyến",
    "Đăng ký xét tốt nghiệp": "Nguyễn Thị Kim Tuyến",
    "Hoãn xét tốt nghiệp": "Nguyễn Thị Kim Tuyến",
    "Đơn xin cấp giấy chứng nhận tốt nghiệp tạm thời": "Nguyễn Thị Kim Tuyến",
    "Đơn xin xem xét môn học tương đương": "Nguyễn Thị Kim Tuyến",

    // Nguyễn Văn Khoa
    "Đơn đăng ký tập sự nghề nghiệp": "Nguyễn Văn Khoa",
    "Đơn đăng ký môn thay thế tốt nghiệp": "Nguyễn Văn Khoa",
    "Đơn xem xét kết quả xét luận văn": "Nguyễn Văn Khoa",
    "Xem xét kết quả xét thực tập": "Nguyễn Văn Khoa",
    "Đăng ký thực tập trễ hạn": "Nguyễn Văn Khoa",
    "Đơn xem xét kết quả xét môn thay thế tốt nghiệp": "Nguyễn Văn Khoa",

    // Nguyễn Thị Kim Tuyền
    "Chuyển nhóm môn học": "Nguyễn Thủy Kim Tuyền",
    "Hủy môn học trong KHHT": "Nguyễn Thủy Kim Tuyền",
    "Xem xét kết quả ĐKMH": "Nguyễn Thủy Kim Tuyền",
    "Đăng ký môn học trùng thời khóa biểu": "Nguyễn Thủy Kim Tuyền",
    "Đơn xin đăng ký môn học trễ hạn": "Nguyễn Thủy Kim Tuyền",
    "Hủy môn học (một số trường hợp vì lý do khách quan)": "Nguyễn Thủy Kim Tuyền",
    "Đơn xin xem xét kết quả đăng ký KHHT": "Nguyễn Thủy Kim Tuyền",
    "Đơn rút môn học": "Nguyễn Thủy Kim Tuyền",
    "Hủy đăng ký học chuyên ngành 2": "Nguyễn Thủy Kim Tuyền",
    "Đơn xác nhận thời khóa biểu": "Nguyễn Thủy Kim Tuyền",
    "Đơn đăng ký môn học (vướng điều kiện môn học trước, môn tiên quyết)": "Nguyễn Thủy Kim Tuyền",

    // Phạm Uyên Thy
    "Đơn đề nghị miễn/chuyển điểm học phần": "Phạm Uyên Thy",

    // Phùng Văn Trúc
    "Xác nhận liên quan đến tuyển sinh": "Phùng Văn Trúc",

    // Phạm Thị Kim Điệp
    "Đăng ký tiếng Anh bổ sung": "Phạm Thị Kim Điệp",
    "Chuyển nhóm môn tiếng Anh": "Phạm Thị Kim Điệp",
    "Hủy lịch học Tiếng Anh": "Phạm Thị Kim Điệp",

    // Nguyễn Thanh Song Trúc
    "Xác nhận tình hình nợ môn học": "Nguyễn Thanh Song Trúc",
    "Đơn không tính điểm môn học tự chọn": "Nguyễn Thanh Song Trúc",

    // Phạm Thị Phương Trinh
    "Đơn đề nghị miễn Tiếng Anh": "Phạm Thị Phương Trinh",

    // Nguyễn Anh Vinh
    "Đơn xin dự thi MOS": "Nguyễn Anh Vinh",

    // Đỗ Thanh Tơ
    "Đăng ký xét hoàn thành giai đoạn 1": "Đỗ Thanh Tơ",
};

// các cột sẽ được giữ lại
exports.keepColumnsV1 = [
    // cho danh sách đơn 1 ngày
    "Người giải quyết đơn",

    "Số BN",
    "Loại đơn (Tên đơn)",
    "MSSV",
    "Họ và tên",
    "Người tiếp nhận",

    // cho danh sách đơn nhiều ngày
    "Mã số đơn",
    "Loại đơn",
    "Mã số sinh viên",
    "Họ tên",
    "Bộ phận xử lý",
    "Lớp",

    "Bộ phận xử lý",
];

// các loại đơn sẽ bị xóa
exports.cacLoaiDonSeBiXoa = [
    "Đơn đề nghị miễn Tiếng Anh",
    "Đơn xin cấp bảng điểm",
    "Gia hạn đóng học phí",
    "Cấp bản sao bằng tốt nghiệp",
];

// tên người dùng ngẫu nhiên để lưu lại lịch sử
exports.names = [
    "ai đó",
    "một người ẩn danh",
    "ai đó hong biết luôn",
    "một người lạ",
    "một người nào đó",
    "người dùng ẩn danh",
    "một người dễ thương nào đó",
];

// URI connect to MongoDB
exports.mongoURI = "mongodb+srv://github:mMWIrT4GWZ7gaPJv@github.ozgezwg.mongodb.net/e001";
exports.MOMENT_FORMAT = "YYYY-MM-DD";
