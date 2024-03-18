$(() => {
    Swal.fire({
        title: "Cảnh báo!",
        timer: 12000,
        timerProgressBar: true,
        icon: "warning",
        html: "Dữ liệu chấm công của tuần trước sẽ được khóa vào <strong>17h00 thứ 2 tuần kế tiếp</strong>!",
    });
});
