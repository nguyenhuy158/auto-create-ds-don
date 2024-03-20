$(() => {
    Swal.fire({
        title: "Lịch sử upload nè!",
        timer: 10000,
        timerProgressBar: true,
        icon: "info",
        html: "Nếu mọi người có upload file gần đây thì hệ thống vẫn còn lưu á mọi người copy file name ra trang tạo trang là được khỏi cần upload file lên lại noà mọi người <br> (file chỉ tồn tại trong vòng 24h thôi nhoa)!",
        // footer: '<a target="_blank" href="https://www.facebook.com/nguyenhuy158">Nếu có lỗi nhớ báo cho huy với nhoa?</a>'
    }).then((result) => {
    });
});