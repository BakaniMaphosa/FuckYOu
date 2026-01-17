export function initTableSettings(parentElement) {
    const gridSelector = parentElement.querySelector('#gridSelector');
    const dimensionDisplay = parentElement.querySelector('#dimensionDisplay');

    let selectedRows = 1;
    let selectedCols = 1;

    // Generate grid selector (10×10 like Google Docs)
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = Math.floor(i / 10) + 1;
        cell.dataset.col = (i % 10) + 1;
        gridSelector.appendChild(cell);
    }

    // Grid hover effect
    const gridCells = parentElement.querySelectorAll('.grid-cell');

    gridCells.forEach(cell => {
        cell.addEventListener('mouseenter', () => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            selectedRows = row;
            selectedCols = col;
            
            // Highlight cells
            gridCells.forEach(c => {
                const cRow = parseInt(c.dataset.row);
                const cCol = parseInt(c.dataset.col);
                
                if (cRow <= row && cCol <= col) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
            
            dimensionDisplay.textContent = `${selectedRows} × ${selectedCols}`;
        });
        
        cell.addEventListener('click', () => {
            console.log(`✅ Table created: ${selectedRows}×${selectedCols}`);
            // You'll handle actual table creation in your main app
            alert(`Creating ${selectedRows}×${selectedCols} table!`);
        });
    });

    // Reset on mouse leave
    gridSelector.addEventListener('mouseleave', () => {
        gridCells.forEach(c => c.classList.remove('active'));
        dimensionDisplay.textContent = `${selectedRows} × ${selectedCols}`;
    });

    // Create button


    // Export dimensions for use in main app
}
