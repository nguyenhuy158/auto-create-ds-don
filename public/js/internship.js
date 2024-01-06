let internshipTable;
$(() => {
    internshipTable = $("#internship-table").DataTable({
        ajax: "/internship/list",
        rowId: "_id",
        buttons: [
            {
                text: `<i class="bi bi-plus"></i>`,
                className: "them-internship-btn btn-outline-primary",
                action: function (e, dt, node, config) { },
            },
            {
                text: `<i class="bi bi-arrow-clockwise"></i>`,
                className: "reload-internship-table-btn",
                action: function (e, dt, node, config) {
                    dt.ajax.reload();
                },
            },
            "spacer",
            {
                text: `<i class="bi bi-three-dots"></i>`,
                extend: "collection",
                className: "options-btn",
                buttons: [
                    "<h3>Export</h3>",
                    "copy",
                    "pdf",
                    "excel",
                    "print",
                    '<h3 class="not-top-heading">Hide/Unhide</h3>',
                    "columnsToggle",
                ],
            },
        ],
        dom:
            "B<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        processing: true,
        language: {
            emptyTable: "Không có dữ liệu",
            info: "Hiển thị (_START_ - _END_) tổng _TOTAL_ người",
            infoEmpty: "Hiển thị (0 - 0) tổng 0 người",
            infoFiltered: "(filtered from _MAX_ total entries)",
            lengthMenu: "Hiển thị _MENU_ người",
            search: "Tìm kiếm",
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                },
            },
            { data: "username" },
            {
                data: "fullName",
                render: function (data) {
                    return data || "";
                },
            },
            {
                data: "soBuoi",
                render: function (data) {
                    return data || "";
                },
            },
            {
                data: "updatedAt",
                render: function (data) {
                    return moment(data).format("DD/MM/YYYY");
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    let editBtn = `<button class="btn btn-outline-primary btn-sm cap-nhat-tai-khoang-btn" 
                                    data-user-id="${row._id}"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#cap-nhat-tai-khoang-internship-modal">
                          <i class="bi bi-pencil-square"></i>
                      </button>`;

                    let deleteBtn = `<button class="btn btn-outline-danger btn-sm xoa-tai-khoang-btn" 
                                    data-user-id="${row._id}"
                                    data-user-name="${row.username}"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#xoa-tai-khoang-internship-modal">
                          <i class="bi bi-trash"></i>
                      </button>`;

                    let resetPasswordBtn = `<button class="btn btn-outline-info btn-sm khoi-phuc-mat-khau-tai-khoang-btn" 
                                    data-user-id="${row._id}"
                                    data-user-name="${row.username}"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#khoi-phuc-mat-khau-tai-khoang-internship-modal">
                          <i class="bi bi-key"></i>
                      </button>`;
                    return `
                            ${editBtn}
                            ${deleteBtn}
                            ${resetPasswordBtn}
                            `;
                },
            },
        ],
    });

    $(".dt-buttons")
        .addClass("mb-3")
        .find("button")
        .each(function () {
            $(this).removeClass("btn-secondary").addClass("btn-outline-primary");
        });
});
