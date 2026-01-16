export function createTable(box) {
    const contentArea = box.querySelector('.content');
    contentArea.innerHTML = "";

    // --- 1. Create Structure ---
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.height = '100%';
    container.style.width = '100%';
    container.style.overflow = 'hidden';

    // Title
    const title = document.createElement('div');
    title.innerText = "Table Title";
    title.contentEditable = "true";
    title.style.textAlign = "center";
    title.style.fontWeight = "bold";
    title.style.padding = "5px";
    title.style.outline = "none";
    title.style.flex = "0 1 auto";
    title.style.minHeight = "0";

    // Table Wrapper
    const tableWrapper = document.createElement('div');
    tableWrapper.style.flex = '1';
    tableWrapper.style.overflow = 'hidden';
    tableWrapper.style.position = 'relative';
    tableWrapper.style.minHeight = '0';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.height = 'calc(100% - 5px)';
    table.style.borderCollapse = 'collapse';
    table.style.tableLayout = 'fixed';
    table.style.marginBottom = '5px';

    tableWrapper.appendChild(table);
    container.appendChild(title);
    container.appendChild(tableWrapper);
    contentArea.appendChild(container);

    // --- 2. Helper Functions ---
    const createCell = () => {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.style.border = '1px solid #ccc';
        td.style.padding = '4px';
        td.style.wordBreak = 'break-word';
        td.style.overflow = 'hidden';
        td.style.height = '1px';
        return td;
    };

    function initTable(rows, cols) {
        table.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
                tr.appendChild(createCell());
            }
            table.appendChild(tr);
        }
    }

    // Initialize
    initTable(3, 3);
}