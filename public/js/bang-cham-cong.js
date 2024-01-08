const grid = x_spreadsheet(document.getElementById("gridctr"));

async function taiBangChamCongToGrid(time) {
    const url = `/cham-cong/events/excel?q=${time}`;
    const workbook = XLSX.read(await (await fetch(url)).arrayBuffer());

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw_data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`raw_data`, raw_data);

    grid.loadData(stox(workbook));
}

setTimeout(async() => {
        await taiBangChamCongToGrid(moment().format('DD/MM/YYYY'));
}, 1000);

$(() => {

        $(document).on("#luu-bang-cham-cong-btn", "click", function () {
                var new_wb = xtos(grid.getData());

                XLSX.writeFile(new_wb, 'sheetjs.xlsx', {});
        });
    
});