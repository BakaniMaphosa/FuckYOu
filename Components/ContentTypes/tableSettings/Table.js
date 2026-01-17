export function createTable(box) {
    const contentArea = box.querySelector('.content');
    contentArea.innerHTML = "";
    contentArea.style.position = "relative";

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

    // --- Settings Button (Top Right Gear) ---
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'TableSettingsBtn';
    settingsBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
    Object.assign(settingsBtn.style, {
        position: 'absolute',
        top: '4px',
        right: '4px',
        width: '28px',
        height: '28px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0',
        transition: 'all 0.2s',
        zIndex: '101',
        color: '#666'
    });

    settingsBtn.addEventListener('mouseenter', () => {
        settingsBtn.style.background = '#f0f0f0';
        settingsBtn.style.color = '#333';
        settingsBtn.style.borderColor = '#999';
    });

    settingsBtn.addEventListener('mouseleave', () => {
        settingsBtn.style.background = 'rgba(255,255,255,0.9)';
        settingsBtn.style.color = '#666';
        settingsBtn.style.borderColor = '#ccc';
    });

    // Show/hide settings button on hover
    contentArea.addEventListener('mouseenter', () => {
        settingsBtn.style.opacity = '1';
    });
    contentArea.addEventListener('mouseleave', () => {
        settingsBtn.style.opacity = '0';
    });

    // Click handler to open settings overlay
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTableSettings(table, box);
    });

    tableWrapper.appendChild(table);
    container.appendChild(title);
    container.appendChild(tableWrapper);
    contentArea.appendChild(container);
    contentArea.appendChild(settingsBtn);

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

    // Store reference to table for settings
    box.tableElement = table;
    box.initTable = initTable;

    // Initialize
    initTable(3, 3);
}

// --- Open Table Settings Overlay ---
function openTableSettings(table, box) {
    // Remove existing settings overlay if present
    const existingOverlay = document.getElementById('TableSettingsOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Create overlay background
    const overlay = document.createElement('div');
    overlay.id = 'TableSettingsOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000'
    });

    // Create settings container
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'table-settings-floating';
    Object.assign(settingsContainer.style, {
        background: 'white',
        border: '3px solid #241C15',
        boxShadow: '10px 10px 0px rgba(0, 0, 0, 0.2)',
        padding: '0',
        minWidth: '320px',
        maxWidth: '500px',
        cursor: 'default',
        position: 'relative'
    });

    // Create header
    const header = document.createElement('div');
    Object.assign(header.style, {
        background: '#E0DDD5',
        padding: '14px 20px',
        fontSize: '14px',
        fontWeight: '800',
        color: '#241C15',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        borderBottom: '3px solid #241C15',
        fontFamily: "'Inter', sans-serif",
        cursor: 'grab'
    });

    const headerTitle = document.createElement('span');
    headerTitle.innerHTML = `⚙️ TABLE SETTINGS`;
    headerTitle.style.pointerEvents = 'none';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    Object.assign(closeBtn.style, {
        background: 'transparent',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#241C15',
        padding: '0 4px',
        lineHeight: '1'
    });
    closeBtn.addEventListener('click', () => overlay.remove());
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = '#ff007a';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = '#241C15';
    });

    header.appendChild(headerTitle);
    header.appendChild(closeBtn);

    // Create body
    const body = document.createElement('div');
    Object.assign(body.style, {
        padding: '24px',
        fontFamily: "'Inter', sans-serif"
    });

    // Dimension label
    const dimensionLabel = document.createElement('div');
    dimensionLabel.innerText = 'Select table size:';
    Object.assign(dimensionLabel.style, {
        fontSize: '13px',
        fontWeight: '600',
        color: '#241C15',
        marginBottom: '12px'
    });

    // Grid selector container
    const gridSelector = document.createElement('div');
    Object.assign(gridSelector.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: '4px',
        margin: '0 auto 16px auto',
        width: 'fit-content'
    });

    // Dimension display
    const dimensionDisplay = document.createElement('div');
    dimensionDisplay.innerText = '3 × 3';
    Object.assign(dimensionDisplay.style, {
        fontSize: '16px',
        fontWeight: '700',
        color: '#241C15',
        textAlign: 'center',
        padding: '12px',
        background: '#F6F6F4',
        border: '2px solid #241C15',
        marginBottom: '16px'
    });

    // Get current table dimensions
    const currentRows = table.rows.length || 3;
    const currentCols = table.rows[0]?.cells.length || 3;
    
    let selectedRows = currentRows;
    let selectedCols = currentCols;
    dimensionDisplay.innerText = `${selectedRows} × ${selectedCols}`;

    const gridCells = [];

    // Generate 10x10 grid
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        const row = Math.floor(i / 10) + 1;
        const col = (i % 10) + 1;
        
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        Object.assign(cell.style, {
            width: '24px',
            height: '24px',
            border: '2px solid #E0DDD5',
            cursor: 'pointer',
            transition: 'all 0.1s',
            background: 'white'
        });

        // Highlight current size on load
        if (row <= currentRows && col <= currentCols) {
            cell.style.background = '#FFE01B';
            cell.style.borderColor = '#241C15';
        }

        cell.addEventListener('mouseenter', () => {
            selectedRows = row;
            selectedCols = col;

            gridCells.forEach(c => {
                const cRow = parseInt(c.dataset.row);
                const cCol = parseInt(c.dataset.col);

                if (cRow <= row && cCol <= col) {
                    c.style.background = '#FFE01B';
                    c.style.borderColor = '#241C15';
                } else {
                    c.style.background = 'white';
                    c.style.borderColor = '#E0DDD5';
                }
            });

            dimensionDisplay.innerText = `${selectedRows} × ${selectedCols}`;
        });

        cell.addEventListener('click', () => {
            // Update the table with new dimensions
            if (box.initTable) {
                box.initTable(selectedRows, selectedCols);
            }
            console.log(`✅ Table resized to: ${selectedRows}×${selectedCols}`);
            overlay.remove();
        });

        gridCells.push(cell);
        gridSelector.appendChild(cell);
    }

    // Reset grid on mouse leave - show current selection
    gridSelector.addEventListener('mouseleave', () => {
        gridCells.forEach(c => {
            const cRow = parseInt(c.dataset.row);
            const cCol = parseInt(c.dataset.col);
            
            if (cRow <= currentRows && cCol <= currentCols) {
                c.style.background = '#FFE01B';
                c.style.borderColor = '#241C15';
            } else {
                c.style.background = 'white';
                c.style.borderColor = '#E0DDD5';
            }
        });
        dimensionDisplay.innerText = `${currentRows} × ${currentCols}`;
        selectedRows = currentRows;
        selectedCols = currentCols;
    });

    body.appendChild(dimensionLabel);
    body.appendChild(gridSelector);
    body.appendChild(dimensionDisplay);

    settingsContainer.appendChild(header);
    settingsContainer.appendChild(body);
    overlay.appendChild(settingsContainer);

    // Close on overlay click (but not on settings container)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // Close on Escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Make settings draggable by header
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target === closeBtn) return;
        isDragging = true;
        header.style.cursor = 'grabbing';
        
        const rect = settingsContainer.getBoundingClientRect();
        settingsContainer.style.position = 'fixed';
        settingsContainer.style.left = rect.left + 'px';
        settingsContainer.style.top = rect.top + 'px';
        settingsContainer.style.margin = '0';
        
        startX = settingsContainer.offsetLeft;
        startY = settingsContainer.offsetTop;
        initialX = e.clientX;
        initialY = e.clientY;
        
        e.preventDefault();
    });

    const dragMove = (e) => {
        if (!isDragging) return;
        settingsContainer.style.left = `${startX + (e.clientX - initialX)}px`;
        settingsContainer.style.top = `${startY + (e.clientY - initialY)}px`;
    };

    const dragEnd = () => {
        isDragging = false;
        header.style.cursor = 'grab';
    };

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

    // Cleanup event listeners when overlay is removed
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                if (node === overlay) {
                    document.removeEventListener('mousemove', dragMove);
                    document.removeEventListener('mouseup', dragEnd);
                    document.removeEventListener('keydown', escHandler);
                    observer.disconnect();
                }
            });
        });
    });
    observer.observe(document.body, { childList: true });

    document.body.appendChild(overlay);
}