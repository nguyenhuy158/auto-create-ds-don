$(() => {
    let currentDay = moment();
    const nextMonday = currentDay.clone().startOf('week').add(1, 'day');
    const lockTime = moment(nextMonday).set('hour', 17).set('minute', 0); // Đặt thời gian khóa là 17:00

    Swal.fire({
        title: "Cảnh báo!",
        timer: 12000,
        timerProgressBar: true,
        icon: "warning",
        html: `Dữ liệu chấm công của tuần trước<br>sẽ được khóa vào <strong>${lockTime.format('DD/MM/YYYY HH:mm')}</strong>!`,
    });
});
