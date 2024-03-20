let calendar;

$(() => {
    // lấy calendar theo id và khởi tạo
    const calendarEl = document.getElementById("calendar");
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        titleFormat: "DD/MM/YY",
        themeSystem: "bootstrap5",
        navLinks: true,
        navLinkDayClick: function (date, jsEvent) {
            console.log("day", moment(date).format("YYYY-MM-DD"));
            console.log("coords", jsEvent.pageX, jsEvent.pageY);
        },
        headerToolbar: {
            left: "prev,next today",
            center: "",
            right: "title",
            // right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        buttonText: {
            today: 'hôm nay',
            month: 'tháng',
            week: 'tuần',
            day: 'ngày',
            list: 'danh sách'
        },
        buttonIcons: {
            prev: 'chevrons-left',
            next: 'chevrons-right',
            prevYear: 'chevrons-left', // double chevron
            nextYear: 'chevrons-right' // double chevron
        },                
        eventSources: [
            {
                url: "/cham-cong/events",
                color: "yellow",
                textColor: "black",
            },
        ],
        eventClick: function (info) {
            const ngayCongId = info.event.id;

            $.ajax({
                url: `/cham-cong/events/${ngayCongId}`,
                method: "GET",
                success: function (response) {
                    const ngayCong = response.data;
                    console.log("ngayCong: ", ngayCong);
                    $(".chinh-sua-ngay-cong-btn").data("ngay-lam-id", ngayCong._id);
                    $(".xoa-ngay-cong-btn").data("ngay-lam-id", ngayCong._id);

                    $("#nguoi-lam-option-modal")
                        .text(ngayCong.nguoiLam.fullName || ngayCong.nguoiLam.username)
                        .val(ngayCong.nguoiLam._id);

                    const gioBuoiSang = ngayCong.gioBuoiSang > 0 ? `+${ngayCong.gioBuoiSang}` : ngayCong.gioBuoiSang;
                    const gioBuoiChieu =
                        ngayCong.gioBuoiChieu > 0 ? `+${ngayCong.gioBuoiChieu}` : ngayCong.gioBuoiChieu;

                    $(".gio-buoi-sang-input-modal").val(`${gioBuoiSang}`);
                    $(".gio-buoi-chieu-input-modal").val(`${gioBuoiChieu}`);
                    $(".gio-lam-them-input-modal").val(ngayCong.gioLamThem);

                    const total = +ngayCong.gioBuoiSang + +ngayCong.gioBuoiChieu + +ngayCong.gioLamThem;
                    $(".tong-gio-lam-them-modal").text(`${total} phút ~ ${(total / 180).toFixed(2)} buổi`);

                    $("#chinh-sua-ngay-cong-modal").modal("show");
                },
                error: function (response) {
                    Swal.fire(response.responseJSON?.message);
                },
            });
        },
    });
    calendar.setOption("locale", "vi");
    calendar.render();

    $("input[name='daterange']").daterangepicker(
        {
            singleDatePicker: true,
            startDate: moment(),
            endDate: moment(),
            locale: {
                format: "DD/MM/YYYY",
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

    /**
     *
     */
    $(".gio-buoi-sang-input, .gio-buoi-chieu-input, .gio-lam-them-input").on("input", function () {
        const isModal = $(this).attr("class").includes("modal");
        const modal = isModal ? "-modal" : "";

        const gioBuoiSang = $(`.gio-buoi-sang-input${modal}`).val();
        const gioBuoiChieu = $(`.gio-buoi-chieu-input${modal}`).val();
        const gioLamThem = $(`.gio-lam-them-input${modal}`).val();

        const total = +gioBuoiSang + +gioBuoiChieu + +gioLamThem;
        $(`.tong-gio-lam-them${modal}`).text(`${total} phút ~ ${(total / 180).toFixed(2)} buổi`);
    });

    /**
     * Them nguoi lam
     */
    $(".them-du-lieu-btn").on("click", function () {
        const ngayLam = $(".ngay-lam-input").val();
        const gioBuoiSang = $(".gio-buoi-sang-input").val();
        const gioBuoiChieu = $(".gio-buoi-chieu-input").val();
        const gioLamThem = $(".gio-lam-them-input").val();
        const nguoiLam = $(".nguoi-lam-input").val();

        if (gioBuoiSang == 0 && gioBuoiChieu == 0 && gioLamThem == 0) {
            Swal.fire("Vui lòng chọn chọn ít nhất một buổi");
            return;
        }

        const data = {
            ngayLam: moment(ngayLam, "DD/MM/YYYY").format("DD/MM/YYYY"),
            gioBuoiSang: gioBuoiSang,
            gioBuoiChieu: gioBuoiChieu,
            gioLamThem: gioLamThem,
            nguoiLam,
        };
        console.log("Data: ", data);

        $.ajax({
            url: "/cham-cong",
            type: "POST",
            data: data,
            success: (response) => {
                Swal.fire(response.message);
                calendar.refetchEvents();
            },
            error: (response) => {
                Swal.fire(response.responseJSON?.message);
            },
        });
    });

    /**
     * Chinh sua ngay cong
     */
    $(".chinh-sua-ngay-cong-btn").on("click", function () {
        const gioBuoiSang = $(".gio-buoi-sang-input-modal").val();
        const gioBuoiChieu = $(".gio-buoi-chieu-input-modal").val();
        const gioLamThem = $(".gio-lam-them-input-modal").val();

        if (gioBuoiSang == 0 && gioBuoiChieu == 0 && gioLamThem == 0) {
            Swal.fire("Vui lòng chọn chọn ít nhất một buổi");
            return;
        }

        const data = {
            id: $(this).data("ngay-lam-id"),
            gioBuoiSang: gioBuoiSang,
            gioBuoiChieu: gioBuoiChieu,
            gioLamThem: gioLamThem,
        };
        console.log("Data: ", data);

        $.ajax({
            url: "/cham-cong",
            type: "PUT",
            data: data,
            success: (response) => {
                Swal.fire(response.message);
                calendar.refetchEvents();
                $("#chinh-sua-ngay-cong-modal").modal("hide");
            },
            error: (response) => {
                Swal.fire(response.responseJSON?.message);
            },
        });
    });

    /**
     * Xóa ngày công
     */
    $(".xoa-ngay-cong-btn").on("click", function () {
        const ngayLamId = $(this).data("ngay-lam-id");

        // Use SweetAlert2 for confirmation dialog
        Swal.fire({
            title: "Xác nhận xóa?",
            text: "Bạn có chắc chắn muốn xóa dữ liệu này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Hủy bỏ",
        }).then((result) => {
            if (result.isConfirmed) {
                // User confirmed, proceed with the DELETE request
                const data = { id: ngayLamId };

                $.ajax({
                    url: "/cham-cong",
                    type: "DELETE",
                    data: data,
                    success: (response) => {
                        Swal.fire(response.message, "", "success");
                        calendar.refetchEvents();
                        $("#chinh-sua-ngay-cong-modal").modal("hide");
                    },
                    error: (response) => {
                        Swal.fire(response.responseJSON?.message, "", "error");
                    },
                });
            }
        });
    });
});
