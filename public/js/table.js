$(() => {
    function createTable(data, dateSent, dateReceive, totalDon) {
        var table = $('<table>').addClass('text-center');

        // Add thead
        var thead = $('<thead>');
        var theadContent = `
    <tr>
        <td colspan="6" class="text-start fw-bold">Trường Đại học Tôn Đức Thắng</td>
    </tr>
    <tr>
        <td colspan="6" class="text-start fw-bold">Phòng Đại học</td>
    </tr>
    <tr>
        <td colspan="6" class="text-center h3">DANH SÁCH BÀN GIAO ĐƠN</td>
    </tr>
    <tr>
        <td colspan="6" class="text-start">Ngày nhận: ${dateSent}</td>
    </tr>
    <tr>
        <td colspan="6" class="text-start"></td>
    </tr>
    <tr>
        <th class="text-center">STT</th>
        <th class="text-center">Số BN</th>
        <th class="text-center">MSSV</th>
        <th class="text-center">Họ và tên</th>
        <th class="text-center">Người giải quyết đơn</th>
        <th class="text-center">Ghi chú</th>
    </tr>
`;
        thead.html(theadContent);
        table.append(thead);

        // Add tbody
        var tbody = $('<tbody>');

        // Add data rows
        $.each(data, function (index, row) {
            console.log(`🚀 🚀 file: table.ejs:122 🚀 row`, row);
            console.log(`🚀 🚀 file: table.ejs:122 🚀 index`, index);
            var tr = $('<tr>');

            if (Object.keys(row).length === 2) {
                tr.html(`
            <td class="text-center fw-bold" colspan="4">${row['Loại đơn (Tên đơn)']}</td>
            <td class="text-center fw-bold">${row['Người giải quyết đơn']}</td>
            <td class="text-center"></td>
        `);
            } else {
                tr.html(`
            <td class="text-center">${row['STT']}</td>
            <td class="text-center">${row['Số BN']}</td>
            <td class="text-center">${row['MSSV']}</td>
            <td class="text-center">${row['Họ và tên']}</td>
            <td class="text-center">${row['Người giải quyết đơn']}</td>
            <td class="text-center">${row['Ghi chú'] || ''}</td>
        `);
            }

            tbody.append(tr);
        });

        table.append(tbody);

        // Add tfoot
        var tfoot = $('<tfoot>');
        var tfootContent = `
    <tr>
        <td colspan="6" class="text-start">Tổng đơn: ${totalDon}</td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td colspan="3" class="text-center">${dateReceive}</td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td colspan="3" class="text-center">Người lập bảng</td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td colspan="3" class="text-center pt-5"></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td colspan="3" class="text-center">Nguyễn Duy Khánh</td>
        <td></td>
    </tr>
`;
        tfoot.html(tfootContent);
        table.append(tfoot);

        $('#DS').html(table);
    }

    toastr.options = {
        closeButton: true,
        debug: false,
        newestOnTop: false,
        progressBar: true,
        positionClass: 'toast-top-right',
        preventDuplicates: false,
        onclick: null,
        showDuration: '1000',
        hideDuration: '10000',
        timeOut: '5000',
        extendedTimeOut: '1000',
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut',
    };

    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();

        var formData = new FormData(this);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.error) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);

                    $('#createDS input').val(data.filename);
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON?.message);
            },
        });
    });

    $('#createDS').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            url: '/',
            type: 'POST',
            data: { filename: $('#filename').val() },
            success: function (data) {
                if (data.error) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    createTable(data.data, data.dateSent, data.dateReceive, data.totalDon);
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON?.message);
            },
        });
    });
});