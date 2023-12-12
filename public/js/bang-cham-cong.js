const grid = x_spreadsheet(document.getElementById("gridctr"));

$(() => {

    (async () => {
        const url = "/cham-cong/events/excel";
        const workbook = XLSX.read(await (await fetch(url)).arrayBuffer());

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw_data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`raw_data`, raw_data);

        grid.loadData(stox(workbook));
    })();

    $("#luu-bang-cham-cong-btn").on("click", function () {
        var new_wb = xtos(grid.getData());

        /* write file and trigger a download */
        XLSX.writeFile(new_wb, 'sheetjs.xlsx', {});
    });
});