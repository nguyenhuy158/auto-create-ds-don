$(() => {
    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
    });
    calendar.render();

    $("input[name='daterange']").daterangepicker(
        {
            singleDatePicker: true,
            startDate: moment(),
            endDate: moment(),
            locale: {
                format: "MM/DD/YYYY",
                applyLabel: "Xác nhận",
                cancelLabel: "Hủy",
                daysOfWeek: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
                monthNames: [
                    "Tháng 1",
                    "Tháng 2",
                    "Tháng 3",
                    "Tháng 4",
                    "Tháng 5",
                    "Tháng 6",
                    "Tháng 7",
                    "Tháng 8",
                    "Tháng 9",
                    "Tháng 10",
                    "Tháng 11",
                    "Tháng 12",
                ],
            },
        },
        function (start, end, label) {
            console.log("start: ", start.format("DD/MM/YYYY"));
            console.log("end: ", end.format("DD/MM/YYYY"));
            console.log("label: ", label);
        },
    );

    $(".them-du-lieu-btn").on("click", function () {
        const ngayLam = $(".ngay-lam-input").val();
        const gioBuoiSang = $(".gio-buoi-sang-input").val();
        const gioBuoiChieu = $(".gio-buoi-chieu-input").val();
        const gioLamThem = $(".gio-lam-them-input").val();
        const nguoiLam = $(".nguoi-lam-input").val();

        const data = {
            ngayLam,
            gioBuoiSang,
            gioBuoiChieu,
            gioLamThem,
            nguoiLam,
        };
        console.log("Data: ", data);
        $.ajax({
            url: "/cham-cong",
            type: "POST",
            data: data,
            success: (response) => {
                Swal.fire(response.message);
            },
            error: (response) => {
                Swal.fire(response.responseJSON?.message);
            },
        });
    });
});
