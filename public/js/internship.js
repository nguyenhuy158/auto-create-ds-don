$(() => {
    $("#internship-table").DataTable({
        ajax: "/internship/list",
        rowId: "_id",

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
                    return `<button class="btn btn-outline-primary btn-sm cap-nhat-tai-khoang-btn" 
                                    data-user-id="${row._id}"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#cap-nhat-tai-khoang-internship-modal">
                          <i class="bi bi-pencil-square"></i>
                      </button>`;
                },
            },
        ],
    });
});
