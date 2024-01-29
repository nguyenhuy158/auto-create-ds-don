// nơi chứa dữ liệu chấm công
const grid = x_spreadsheet(document.getElementById("gridctr"));

// hàm lấy dữ liệu từ server đổ vào grid
async function taiBangChamCongToGrid(time) {
    const url = `/cham-cong/events/excel?time=${time}`;
    const workbook = XLSX.read(await (await fetch(url)).arrayBuffer());

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw_data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    // console.log(`raw_data`, raw_data);

    grid.loadData(stox(workbook));
}

// tải dữ liệu chấm công về từ server
// lấy mặt định là tháng hiện tại
setTimeout(async () => {
    await taiBangChamCongToGrid(moment().format('DD/MM/YYYY'));
}, 1000);

$(() => {

    // tải bảng chấm công về thành file excel
    $("#luu-bang-cham-cong-btn").on("click", function () {
        var new_wb = xtos(grid.getData());

        XLSX.writeFile(new_wb, `bang-cham-cong-${moment(taoNgayTuSelect(), 'DD_MM_YYYY').format('MM-YYYY')}.xlsx`, {});
    });

    // tải dữ liệu chấm công về từ server
    $("#tai-du-lieu-btn").on("click", async function () {
        const date = taoNgayTuSelect();

        await taiBangChamCongToGrid(date);
    });

});