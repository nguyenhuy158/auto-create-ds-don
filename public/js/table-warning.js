$(() => {
    const storedTime = localStorage.getItem("access-time");
    const currentTime = moment();
    const MAX_ACCESS_TIME = 10;

    if (!storedTime ||
        (storedTime && currentTime.diff(moment(storedTime), 'minutes') > MAX_ACCESS_TIME)) {
        localStorage.setItem("access-time", currentTime);

        Swal.fire({
            icon: "info",
            title: "Nhớ nhe mọi người!",
            timer: 5000,
            timerProgressBar: true,
            text: "Mọi người nhớ check lại danh sách trước khi in nha nha nha!",
            footer: '<a target="_blank" href="https://www.facebook.com/nguyenhuy158">Nếu có lỗi nhớ báo cho huy với nhoa?</a>'
        }).then((result) => {
            Swal.fire({
                title: "Lần đầu truy cập!",
                timer: 10000,
                timerProgressBar: true,
                imageHeight: 150,
                imageUrl: "images/piggy-mengmeng/sticker_14.webp",
                html: "Nếu lần đầu mọi người truy cập thì nhớ xem hướng dẫn ở đây ha ha!" +
                    `<br><a target="_blank" href="/huong-dan-su-dung">Click đây noà</a>`,
                footer: '<a target="_blank" href="https://www.facebook.com/nguyenhuy158">Nếu có lỗi nhớ báo cho huy với nhoa?</a>'
            });
        });

    }
});