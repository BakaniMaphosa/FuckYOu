const editableTable = document.getElementById('editableTable');
const addRowBtn = document.getElementById('addRowBtn');
const addColBtn = document.getElementById('addColBtn');
const deleteRowBtn = document.getElementById('deleteRowBtn');
const deleteColBtn = document.getElementById('deleteColBtn');

// Initialize with 3x3 table by default
export function initTable(rows = 3, cols = 3) {
    editableTable.innerHTML = '';
    
    for (let r = 0; r < rows; r++) {
        const row = document.createElement('tr');
        
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = '';
            row.appendChild(cell);
        }
        
        editableTable.appendChild(row);
    }
    
    console.log(`✅ Initialized ${rows}×${cols} table`);
}

// Add row
addRowBtn.addEventListener('click', () => {
    const cols = editableTable.rows[0]?.cells.length || 1;
    const row = document.createElement('tr');
    
    for (let c = 0; c < cols; c++) {
        const cell = document.createElement('td');
        cell.contentEditable = true;
        cell.textContent = '';
        row.appendChild(cell);
    }
    
    editableTable.appendChild(row);
});

// Add column
addColBtn.addEventListener('click', () => {
    const rows = editableTable.rows;
    
    for (let r = 0; r < rows.length; r++) {
        const cell = document.createElement('td');
        cell.contentEditable = true;
        cell.textContent = '';
        rows[r].appendChild(cell);
    }
});

// Delete row
deleteRowBtn.addEventListener('click', () => {
    if (editableTable.rows.length > 1) {
        editableTable.deleteRow(-1);
    } else {
        alert('❌ Cannot delete the last row!');
    }
});

// Delete column
deleteColBtn.addEventListener('click', () => {
    const rows = editableTable.rows;
    
    if (rows[0]?.cells.length > 1) {
        for (let r = 0; r < rows.length; r++) {
            rows[r].deleteCell(-1);
        }
    } else {
        alert('❌ Cannot delete the last column!');
    }
});

// Initialize on load
initTable(3, 3);