//Works for bar, line, pie and radar.
export function createGraph(box, type) {
    // We want to put the graph in the .content div, not the main box div
    // so it doesn't overlap the drag handle
    const contentArea = box.querySelector('.content');
    contentArea.innerHTML = ""; // Clear the "Type your notes" text
    contentArea.style.position = "relative";
    
    const GraphCanvas = document.createElement('canvas');
    GraphCanvas.className = "GraphCanvas";
    
    // Stretch to fit the content area
    GraphCanvas.style.width = "100%";
    GraphCanvas.style.height = "100%";
    
    contentArea.append(GraphCanvas);

    const ctx = GraphCanvas.getContext('2d');

    const myChart = new Chart(ctx, {
        type: type, 
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green'],
            datasets: [{
                label: 'Votes',
                data: [12, 19, 3, 5],
                backgroundColor: '#ff007a', 
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false 
        }
    });

    // Store the chart on the main box so the resize logic can find it
    box.chartInstance = myChart;
    box.chartType = type;

    // --- Settings Button (Top Right Gear) ---
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'GraphSettingsBtn';
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
        openGraphSettings(box, myChart);
    });

    contentArea.appendChild(settingsBtn);
}

// --- Open Graph Settings Overlay ---
async function openGraphSettings(box, chartInstance) {
    // Remove existing settings overlay if present
    const existingOverlay = document.getElementById('GraphSettingsOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Create overlay background
    const overlay = document.createElement('div');
    overlay.id = 'GraphSettingsOverlay';
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
settingsContainer.className = 'graph-settings-floating';
Object.assign(settingsContainer.style, {
    background: '#F6F6F4',
    border: '3px solid #241C15',
    boxShadow: '10px 10px 0px rgba(0, 0, 0, 0.2)',
    padding: '0',
    width: '90vh',  // <-- CHANGE THIS VALUE
    height: '80vh', // <-- CHANGE THIS VALUE
   
    // ... rest of styles
});

    // Create header (draggable)
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
        cursor: 'grab',
        flexShrink: '0'
    });

    const headerTitle = document.createElement('span');
    headerTitle.innerHTML = `📊 GRAPH SETTINGS`;
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

    // Create body container (scrollable)
    const bodyContainer = document.createElement('div');
    bodyContainer.id = 'GraphSettingsBody';
    Object.assign(bodyContainer.style, {
        flex: '1',
        overflow: 'auto',
        padding: '0'
    });

    // Create the GraphSettings div that will hold the content
    const graphSettingsDiv = document.createElement('div');
    graphSettingsDiv.id = 'GraphSettings';
    Object.assign(graphSettingsDiv.style, {
        fontFamily: '"Inter", sans-serif',
        padding: '16px',
        background: '#F6F6F4',
        width: '100%',
        height: '100%',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '320px',
        boxSizing: 'border-box'
    });

    bodyContainer.appendChild(graphSettingsDiv);
    settingsContainer.appendChild(header);
    settingsContainer.appendChild(bodyContainer);
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

    // Now build the graph settings UI
    buildGraphSettingsUI(graphSettingsDiv, box, chartInstance, overlay);
}

// --- Build Graph Settings UI ---
function buildGraphSettingsUI(container, box, chartInstance, overlay) {
    // Inject CSS if not present
    if (!document.querySelector('link[href*="graphSettings.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/Components/ContentTypes/graphSettings/graphSettings.css';
        document.head.appendChild(link);
    }

    // Build the settings HTML
    container.innerHTML = `
        <div id="graphHeader">
            <header style="font-family: 'IBM Plex Serif', serif; font-weight: 800; font-size: 18px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 3px solid #241C15; padding-bottom: 10px; color: #241C15;">
                Graph Configuration
            </header>
        </div>

        <!-- GRAPH TYPE SELECTOR -->
        <div id="chooseGraph" class="dropdown" style="position: relative; width: 100%; margin-bottom: 16px;">
            <button class="dropbtn" id="graphTypeBtn" style="width: 100%; background: #FFFFFF; padding: 12px 16px; font-size: 13px; font-weight: 700; border: 3px solid #241C15; cursor: pointer; text-align: left; display: flex; justify-content: space-between; align-items: center; color: #241C15; box-shadow: 4px 4px 0px #241C15;">
                TYPE: 📊 BAR CHART <span>↓</span>
            </button>
            <div class="dropdown-content" style="display: none; position: absolute; background: #FFFFFF; width: 100%; border: 3px solid #241C15; border-top: none; z-index: 100; box-shadow: 4px 4px 0px #241C15;">
                <a data-type="bar" style="padding: 12px 16px; text-decoration: none; display: block; color: #241C15; font-size: 13px; font-weight: 600; border-bottom: 1px solid #E0DDD5; cursor: pointer;">📊 Bar Chart</a>
                <a data-type="line" style="padding: 12px 16px; text-decoration: none; display: block; color: #241C15; font-size: 13px; font-weight: 600; border-bottom: 1px solid #E0DDD5; cursor: pointer;">📈 Line Graph</a>
                <a data-type="pie" style="padding: 12px 16px; text-decoration: none; display: block; color: #241C15; font-size: 13px; font-weight: 600; cursor: pointer;">🥧 Pie Chart</a>
            </div>
        </div>

        <!-- DATA INPUT SECTION -->
        <div id="independentVars" class="var-section" style="margin-top: 16px; background: #FFFFFF; border: 3px solid #241C15; padding: 12px; box-shadow: 4px 4px 0px #241C15;">
            <div class="header-row" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                <div class="VarHeader" style="font-weight: 800; font-size: 12px; text-transform: uppercase; color: #241C15; letter-spacing: 0.5px;">Labels (X)</div>
            </div>
            <div id="IndependentVarsInput" class="scroll-track" style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; min-height: 50px; align-items: center; border-top: 2px solid #E0DDD5;"></div>
        </div>

        <div id="dependentVars" class="var-section" style="margin-top: 16px; background: #FFFFFF; border: 3px solid #241C15; padding: 12px; box-shadow: 4px 4px 0px #241C15;">
            <div class="header-row" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                <div class="VarHeader" style="font-weight: 800; font-size: 12px; text-transform: uppercase; color: #241C15; letter-spacing: 0.5px;">Values (Y)</div>
            </div>
            <div id="DependentVarsInput" class="scroll-track" style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; min-height: 50px; align-items: center; border-top: 2px solid #E0DDD5;"></div>
        </div>

        <!-- COLOR SETTINGS -->
        <div class="var-section" style="margin-top: 16px; background: #FFFFFF; border: 3px solid #241C15; padding: 12px; box-shadow: 4px 4px 0px #241C15;">
            <div class="header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div class="VarHeader" style="font-weight: 800; font-size: 12px; text-transform: uppercase; color: #241C15;">Bar Color</div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="color" id="barColorPicker" value="#ff007a" style="width: 50px; height: 35px; border: 2px solid #241C15; cursor: pointer; padding: 0;">
                <span id="colorHexDisplay" style="font-size: 12px; font-weight: 600; color: #241C15;">#ff007a</span>
            </div>
        </div>

        <!-- DEFAULT SETTINGS -->
        <details style="margin-top: 16px; background: #FFFFFF; border: 3px solid #241C15; box-shadow: 4px 4px 0px #241C15;">
            <summary style="padding: 12px; font-weight: 800; font-size: 12px; text-transform: uppercase; color: #241C15; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                <span>🛠 Default Settings</span>
                <span>+</span>
            </summary>
            <div style="padding: 12px; border-top: 2px solid #E0DDD5; display: flex; flex-direction: column; gap: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #241C15;">
                    <input type="checkbox" id="showLegend"> Show Legend
                </label>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 11px; font-weight: 700; color: #241C15;">Chart Title</label>
                    <input type="text" id="chartTitle" placeholder="Enter title..." style="padding: 6px; border: 2px solid #241C15; font-size: 12px; background: #F6F6F4;">
                </div>
            </div>
        </details>

        <!-- GRAPH SPECIFIC SETTINGS -->
        <details id="graphSpecificSettings" style="margin-top: 16px; background: #FFFFFF; border: 3px solid #241C15; box-shadow: 4px 4px 0px #241C15;">
            <summary style="padding: 12px; font-weight: 800; font-size: 12px; text-transform: uppercase; color: #241C15; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                <span>📈 Graph Specific</span>
                <span>+</span>
            </summary>
            <div id="specificSettingsContent" style="padding: 12px; border-top: 2px solid #E0DDD5; display: flex; flex-direction: column; gap: 10px;">
                <!-- Dynamic content will be injected here -->
            </div>
        </details>

        <!-- APPLY BUTTON -->
        <button id="applyGraphSettings" style="width: 100%; margin-top: 20px; padding: 14px; background: #FFE01B; color: #241C15; border: 3px solid #241C15; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; box-shadow: 4px 4px 0px #241C15; transition: all 0.2s;">
            APPLY CHANGES
        </button>
    `;

    // Get current chart data
    const currentLabels = chartInstance.data.labels || ['Red', 'Blue', 'Yellow', 'Green'];
    const currentData = chartInstance.data.datasets[0]?.data || [12, 19, 3, 5];
    const currentColor = chartInstance.data.datasets[0]?.backgroundColor || '#ff007a';
    const currentOptions = chartInstance.options || {};
    const currentType = chartInstance.config.type || 'bar';

    // Update type button text
    const typeLabels = { 'bar': '📊 Bar Chart', 'line': '📈 Line Graph', 'pie': '🥧 Pie Chart' };
    const typeBtn = container.querySelector('#graphTypeBtn');
    typeBtn.innerHTML = `TYPE: ${typeLabels[currentType] || typeLabels['bar']} <span>↓</span>`;

    // Setup dropdown
    const dropdown = container.querySelector('#chooseGraph');
    const dropdownContent = container.querySelector('.dropdown-content');
    
    dropdown.addEventListener('mouseenter', () => {
        dropdownContent.style.display = 'block';
    });
    dropdown.addEventListener('mouseleave', () => {
        dropdownContent.style.display = 'none';
    });

    let selectedType = currentType;

    dropdownContent.querySelectorAll('a').forEach(item => {
        item.addEventListener('click', (e) => {
            selectedType = item.dataset.type;
            typeBtn.innerHTML = `TYPE: ${typeLabels[selectedType]} <span>↓</span>`;
            dropdownContent.style.display = 'none';
            updateSpecificSettingsUI(selectedType);
            
            // Visual feedback
            typeBtn.style.backgroundColor = "#241C15";
            typeBtn.style.color = "#FFE01B";
            setTimeout(() => {
                typeBtn.style.backgroundColor = "#FFFFFF";
                typeBtn.style.color = "#241C15";
            }, 200);
        });

        item.addEventListener('mouseenter', () => {
            item.style.background = '#241C15';
            item.style.color = '#FFE01B';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = '#FFFFFF';
            item.style.color = '#241C15';
        });
    });

    // Populate label inputs
    const indyTrack = container.querySelector('#IndependentVarsInput');
    const depTrack = container.querySelector('#DependentVarsInput');

    function createVarBox(value, type = 'text') {
        const input = document.createElement('input');
        input.className = 'var-box';
        input.type = type;
        input.value = value;
        Object.assign(input.style, {
            flex: '0 0 70px',
            height: '35px',
            border: '2px solid #241C15',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: '600',
            background: '#FFFFFF',
            outline: 'none'
        });
        input.addEventListener('focus', () => {
            input.style.boxShadow = '2px 2px 0 #FFE01B';
        });
        input.addEventListener('blur', () => {
            input.style.boxShadow = 'none';
        });
        return input;
    }

    function createAddButton(track, type) {
        const btn = document.createElement('button');
        btn.className = 'load-more-btn';
        btn.innerText = '+';
        Object.assign(btn.style, {
            flex: '0 0 35px',
            height: '35px',
            background: '#F6F6F4',
            border: '2px dashed #241C15',
            cursor: 'pointer',
            fontWeight: '800',
            color: '#241C15',
            fontSize: '16px'
        });
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#FFE01B';
            btn.style.borderStyle = 'solid';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = '#F6F6F4';
            btn.style.borderStyle = 'dashed';
        });
        btn.addEventListener('click', () => {
            const newBox = createVarBox('', type === 'dep' ? 'number' : 'text');
            track.insertBefore(newBox, btn);
            newBox.focus();
        });
        return btn;
    }

    // Populate labels
    currentLabels.forEach(label => {
        indyTrack.appendChild(createVarBox(label, 'text'));
    });
    indyTrack.appendChild(createAddButton(indyTrack, 'indy'));

    // Populate values
    currentData.forEach(val => {
        depTrack.appendChild(createVarBox(val, 'number'));
    });
    depTrack.appendChild(createAddButton(depTrack, 'dep'));

    // Color picker
    const colorPicker = container.querySelector('#barColorPicker');
    const colorDisplay = container.querySelector('#colorHexDisplay');
    
    // Set current color
    const colorHex = currentColor.startsWith('#') ? currentColor : '#ff007a';
    colorPicker.value = colorHex;
    colorDisplay.innerText = colorHex;

    colorPicker.addEventListener('input', (e) => {
        colorDisplay.innerText = e.target.value;
    });

    // --- Initialize Default Settings ---
    const showLegendCb = container.querySelector('#showLegend');
    const chartTitleInput = container.querySelector('#chartTitle');
    
    // Set initial values from chart options
    showLegendCb.checked = currentOptions.plugins?.legend?.display !== false;
    chartTitleInput.value = currentOptions.plugins?.title?.text || '';

    // --- Initialize Graph Specific Settings ---
    const specificContent = container.querySelector('#specificSettingsContent');

    function updateSpecificSettingsUI(type) {
        specificContent.innerHTML = '';
        
        if (type === 'bar') {
            const isHoriz = currentOptions.indexAxis === 'y';
            specificContent.innerHTML = `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #241C15;">
                    <input type="checkbox" id="horizontalBar" ${isHoriz ? 'checked' : ''}> Horizontal Bars
                </label>
            `;
        } else if (type === 'line') {
            const tension = chartInstance.data.datasets[0]?.tension || 0;
            const fill = chartInstance.data.datasets[0]?.fill || false;
            specificContent.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 11px; font-weight: 700; color: #241C15;">Curve Tension (0-1)</label>
                    <input type="number" id="lineTension" min="0" max="1" step="0.1" value="${tension}" style="padding: 6px; border: 2px solid #241C15; font-size: 12px;">
                </div>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #241C15;">
                    <input type="checkbox" id="fillArea" ${fill ? 'checked' : ''}> Fill Area
                </label>
            `;
        } else if (type === 'pie') {
            let cutout = currentOptions.cutout || '0%';
            if (typeof cutout === 'string') cutout = parseInt(cutout);
            specificContent.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 11px; font-weight: 700; color: #241C15;">Donut Cutout %</label>
                    <input type="number" id="cutoutPercentage" min="0" max="90" step="10" value="${cutout}" style="padding: 6px; border: 2px solid #241C15; font-size: 12px;">
                </div>
            `;
        }
    }
    updateSpecificSettingsUI(currentType);

    // Apply button
    const applyBtn = container.querySelector('#applyGraphSettings');
    
    applyBtn.addEventListener('mouseenter', () => {
        applyBtn.style.transform = 'translate(-2px, -2px)';
        applyBtn.style.boxShadow = '6px 6px 0px #241C15';
    });
    applyBtn.addEventListener('mouseleave', () => {
        applyBtn.style.transform = 'translate(0, 0)';
        applyBtn.style.boxShadow = '4px 4px 0px #241C15';
    });

    applyBtn.addEventListener('click', () => {
        // Collect new labels
        const newLabels = Array.from(indyTrack.querySelectorAll('.var-box'))
            .map(input => input.value)
            .filter(val => val.trim() !== '');

        // Collect new values
        const newData = Array.from(depTrack.querySelectorAll('.var-box'))
            .map(input => parseFloat(input.value) || 0);

        // Get new color
        const newColor = colorPicker.value;

        // Get Default Settings
        const showLegend = showLegendCb.checked;
        const titleText = chartTitleInput.value;

        // Get Specific Settings
        let specificOptions = {};
        let specificDatasetOptions = {};

        if (selectedType === 'bar') {
            specificOptions.indexAxis = container.querySelector('#horizontalBar')?.checked ? 'y' : 'x';
        } else if (selectedType === 'line') {
            specificDatasetOptions.tension = parseFloat(container.querySelector('#lineTension')?.value || 0);
            specificDatasetOptions.fill = container.querySelector('#fillArea')?.checked;
        } else if (selectedType === 'pie') {
            const cutout = container.querySelector('#cutoutPercentage')?.value;
            if (cutout) specificOptions.cutout = cutout + '%';
        }

        // Update chart
        if (selectedType !== chartInstance.config.type || (selectedType === 'bar' && specificOptions.indexAxis !== chartInstance.options.indexAxis)) {
            // Need to recreate chart for type change
            const canvas = box.querySelector('.GraphCanvas');
            const ctx = canvas.getContext('2d');
            
            chartInstance.destroy();
            
            const newChart = new Chart(ctx, {
                type: selectedType,
                data: {
                    labels: newLabels,
                    datasets: [{
                        label: 'Data',
                        data: newData,
                        backgroundColor: newColor,
                        borderColor: newColor,
                        borderWidth: 1,
                        ...specificDatasetOptions
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    ...specificOptions,
                    plugins: {
                        legend: { display: showLegend },
                        title: { display: !!titleText, text: titleText }
                    }
                }
            });
            
            box.chartInstance = newChart;
            box.chartType = selectedType;
        } else {
            // Just update data
            chartInstance.data.labels = newLabels;
            chartInstance.data.datasets[0].data = newData;
            chartInstance.data.datasets[0].backgroundColor = newColor;
            chartInstance.data.datasets[0].borderColor = newColor;
            
            // Apply specific dataset options
            Object.assign(chartInstance.data.datasets[0], specificDatasetOptions);

            // Apply global options
            chartInstance.options.plugins.legend.display = showLegend;
            chartInstance.options.plugins.title = { display: !!titleText, text: titleText };
            if (specificOptions.cutout) chartInstance.options.cutout = specificOptions.cutout;

            chartInstance.update();
        }

        console.log('✅ Graph updated!', { type: selectedType, labels: newLabels, data: newData, color: newColor });
        
        // Close overlay
        overlay.remove();
    });
}
