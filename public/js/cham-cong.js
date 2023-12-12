
let calendar;

$(() => {
    // Initialize FullCalendar
    const calendarEl = document.getElementById("calendar");
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        titleFormat: 'DD/MM/YY',
        themeSystem: 'bootstrap5',
        navLinks: true,
        navLinkDayClick: function (date, jsEvent) {
            console.log('day', moment(date).format('YYYY-MM-DD'));
            console.log('coords', jsEvent.pageX, jsEvent.pageY);
        },
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventSources: [
            {
                url: '/cham-cong/events',
                color: 'yellow',
                textColor: 'black'
            },
        ]
    });
    calendar.setOption('locale', 'vi');
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
            ngayLam: moment(ngayLam, "MM/DD/YYYY").format("DD/MM/YYYY"),
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
