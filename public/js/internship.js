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
                render: function (data) {
                    return `<button class="btn btn-outline-primary btn-sm">
                          <i class="bi bi-pencil-square"></i>
                      </button>`;
                },
            },
        ],
    });
});
