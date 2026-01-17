export function graphSettings(){

        // ============================================
        // STATE
        // ============================================
        let currentGraphType = 'line';
        let datasets = [];
        let currentLineIndex = 0;
        const indyTrack = document.getElementById('IndependentVarsInput');
        const depTrack = document.getElementById('DependentVarsInput');
        let barColors = [];
        let lineColors = [];
        let pieColors = [];
        let defaultGlobalHTML = ''; // Cache for original global settings

        // ============================================
        // GRAPH TYPE SELECTION
        // ============================================
        window.setGraphType = (type) => {
            currentGraphType = type;
            
            const btn = document.getElementById('graphTypeBtn');
            const typeLabels = {
                'bar': '📊 Bar Chart',
                'line': '📈 Line Graph',
                'pie': '🥧 Pie Chart'
            };
            
            btn.innerHTML = `TYPE: ${typeLabels[type]} <span>↓</span>`;
            btn.style.backgroundColor = "var(--caviar)";
            btn.style.color = "var(--banana)";
            setTimeout(() => {
                btn.style.backgroundColor = "";
                btn.style.color = "";
            }, 200);

            updateTypeSpecificSections(type);

            // Handle Default Settings Section (Renaming & Dynamic Content)
            const globalHeader = Array.from(document.querySelectorAll('.section-header')).find(h => h.textContent.toUpperCase().includes('GLOBAL') || h.textContent.toUpperCase().includes('DEFAULT'));
            if (globalHeader) {
                globalHeader.innerHTML = 'DEFAULT SETTINGS <span class="toggle-icon">▼</span>';
                
                const contentDiv = globalHeader.nextElementSibling;
                if (contentDiv && !defaultGlobalHTML) defaultGlobalHTML = contentDiv.innerHTML;

                if (type === 'bar') {
                    renderBarSettings(contentDiv);
                } else if (type === 'line') {
                    renderLineSettings(contentDiv);
                } else if (type === 'pie') {
                    renderPieSettings(contentDiv);
                } else if (defaultGlobalHTML) {
                    contentDiv.innerHTML = defaultGlobalHTML;
                }
            }

            // Handle Pie Chart: Headers & Visibility
            const depSection = depTrack.closest('.var-section');
            const indySection = indyTrack.closest('.var-section');
            
            // Ensure Dependent Section is visible
            if (depSection) depSection.style.display = 'block';
            if (depTrack) depTrack.style.display = 'flex';

            if (indySection) {
                const indyHeader = indySection.querySelector('.VarHeader');
                const indyToggle = indySection.querySelector('.toggle-container');

                if (type === 'pie') {
                    if (indyHeader) indyHeader.textContent = "PIE LABELS";
                    if (indyToggle) indyToggle.style.display = "none";
                } else {
                    if (indyHeader) indyHeader.textContent = "INDEPENDENT (X)";
                    if (indyToggle) indyToggle.style.display = "flex";
                }
            }

            if (depSection) {
                const depHeader = depSection.querySelector('.VarHeader');
                const depToggle = depSection.querySelector('.toggle-container');

                if (type === 'pie') {
                    if (depHeader) depHeader.textContent = "PERCENTAGE";
                    if (depToggle) depToggle.style.display = "none";
                } else {
                    if (depHeader) depHeader.textContent = "DEPENDENT (Y)";
                    if (depToggle) depToggle.style.display = "flex";
                }
            }

            // Handle Line Control Bar Visibility
            const lineControlBar = document.getElementById('lineControlBar');
            if (lineControlBar) {
                lineControlBar.style.display = type === 'line' ? 'flex' : 'none';
            }

            console.log(`📊 Graph type: ${type}`);
            processAllData();
        };

        // ============================================
        // BAR SETTINGS RENDERER
        // ============================================
        function renderBarSettings(container) {
            container.innerHTML = `
                <div class="grid-2x2">
                    <!-- GENERAL BOX -->
                    <div class="subsection">
                        <div class="subsection-title">General</div>
                        <div class="control-group">
                            <label class="control-label">Direction</label>
                            <select id="barOrientation" class="control-select">
                                <option value="vertical">Vertical</option>
                                <option value="horizontal">Horizontal</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="showTitle" checked>
                                <div class="toggle-track"></div>
                                <span class="control-label">Show Title</span>
                            </label>
                        </div>
                    </div>

                    <!-- APPEARANCE BOX -->
                    <div class="subsection" style="min-width: 0;">
                        <div class="subsection-title">Appearance</div>
                        
                        <!-- Mini Color Carousel -->
                        <div class="control-group">
                            <label class="control-label">Bar Colors</label>
                            <div id="barColorTrack" class="scroll-track" style="min-height: 40px; padding: 4px 0; gap: 4px; overflow-x: auto; width: 100%;">
                                <!-- Color pickers injected here -->
                            </div>
                        </div>

                        <div class="control-row">
                            <div class="control-group">
                                <label class="control-label">BG Color</label>
                                <input type="color" id="bgColor" class="control-color" value="#ffffff">
                            </div>
                            <div class="control-group">
                                <label class="control-label">Font</label>
                                <select id="fontFamily" class="control-select" style="width: 80px;">
                                    <option value="Inter">Inter</option>
                                    <option value="IBM Plex Serif">Serif</option>
                                    <option value="monospace">Mono</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Re-attach listeners to new inputs
            container.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('input', processAllData);
                el.addEventListener('change', processAllData);
            });
            
            updateBarColorInputs();
        }

        function updateBarColorInputs() {
            const track = document.getElementById('barColorTrack');
            if (!track) return;

            const dataCount = document.querySelectorAll('#IndependentVarsInput .var-box').length;
            
            // Ensure we have at least as many colors as data points
            while (barColors.length < dataCount) {
                barColors.push('#FFE01B');
            }

            // Clear and Rebuild to maintain order with button
            track.innerHTML = '';

            barColors.forEach((color, i) => {
                const picker = document.createElement('input');
                picker.type = 'color';
                picker.className = 'var-box';
                picker.style.cssText = "padding: 0; width: 30px; height: 30px; flex: 0 0 30px; cursor: pointer;";
                picker.value = color;
                picker.oninput = (e) => {
                    barColors[i] = e.target.value;
                    processAllData();
                };
                track.appendChild(picker);
            });

            // Add "Load More" Button
            const addBtn = document.createElement('button');
            addBtn.className = 'var-box load-more-btn';
            addBtn.innerText = '+';
            addBtn.style.cssText = "padding: 0; width: 30px; height: 30px; flex: 0 0 30px; cursor: pointer; display: flex; align-items: center; justify-content: center;";
            addBtn.onclick = () => {
                barColors.push('#FFE01B');
                updateBarColorInputs();
                processAllData();
                setTimeout(() => track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' }), 10);
            };
            track.appendChild(addBtn);
        }

        // ============================================
        // LINE SETTINGS RENDERER
        // ============================================
        function renderLineSettings(container) {
            container.innerHTML = `
                <div class="grid-2x2">
                    <!-- GENERAL BOX -->
                    <div class="subsection">
                        <div class="subsection-title">General</div>
                        <div class="control-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="showTitle" checked>
                                <div class="toggle-track"></div>
                                <span class="control-label">Show Title</span>
                            </label>
                        </div>
                        <div class="control-group">
                            <label class="control-label">Legend</label>
                            <input type="text" id="datasetName" class="control-input" placeholder="Series Name">
                        </div>
                    </div>

                    <!-- APPEARANCE BOX -->
                    <div class="subsection" style="min-width: 0;">
                        <div class="subsection-title">Appearance</div>
                        
                        <!-- Mini Color Carousel -->
                        <div class="control-group">
                            <label class="control-label">Line Colors</label>
                            <div id="lineColorTrack" class="scroll-track" style="min-height: 40px; padding: 4px 0; gap: 4px; overflow-x: auto; width: 100%;">
                                <!-- Color pickers injected here -->
                            </div>
                        </div>

                        <div class="control-row">
                            <div class="control-group">
                                <label class="control-label">BG Color</label>
                                <input type="color" id="bgColor" class="control-color" value="#ffffff">
                            </div>
                            <div class="control-group">
                                <label class="control-label">Font</label>
                                <select id="fontFamily" class="control-select" style="width: 80px;">
                                    <option value="Inter">Inter</option>
                                    <option value="IBM Plex Serif">Serif</option>
                                    <option value="monospace">Mono</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Re-attach listeners
            container.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('input', processAllData);
                el.addEventListener('change', processAllData);
            });
            
            updateLineColorInputs();
        }

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function updateLineColorInputs() {
            const track = document.getElementById('lineColorTrack');
            if (!track) return;

            // Ensure color exists for current line
            if (!lineColors[currentLineIndex]) {
                lineColors[currentLineIndex] = currentLineIndex === 0 ? '#ff007a' : getRandomColor();
            }

            track.innerHTML = '';

            const picker = document.createElement('input');
            picker.type = 'color';
            picker.className = 'var-box';
            picker.style.cssText = "padding: 0; width: 100%; height: 32px; cursor: pointer; border: 2px solid var(--caviar);";
            picker.value = lineColors[currentLineIndex];
            picker.oninput = (e) => { lineColors[currentLineIndex] = e.target.value; processAllData(); };
            track.appendChild(picker);
        }

        // ============================================
        // PIE SETTINGS RENDERER
        // ============================================
        function renderPieSettings(container) {
            container.innerHTML = `
                <div class="grid-2x2">
                    <!-- GENERAL BOX -->
                    <div class="subsection">
                        <div class="subsection-title">General</div>
                        <div class="control-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="showTitle" checked>
                                <div class="toggle-track"></div>
                                <span class="control-label">Show Title</span>
                            </label>
                        </div>
                        <div class="control-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="pieShowKeys" checked>
                                <div class="toggle-track"></div>
                                <span class="control-label">Show Keys</span>
                            </label>
                        </div>
                    </div>

                    <!-- APPEARANCE BOX -->
                    <div class="subsection" style="min-width: 0;">
                        <div class="subsection-title">Appearance</div>
                        
                        <!-- Mini Color Carousel -->
                        <div class="control-group">
                            <label class="control-label">Pie Colors</label>
                            <div id="pieColorTrack" class="scroll-track" style="min-height: 40px; padding: 4px 0; gap: 4px; overflow-x: auto; width: 100%;">
                                <!-- Color pickers injected here -->
                            </div>
                        </div>

                        <div class="control-row">
                            <div class="control-group">
                                <label class="control-label">BG Color</label>
                                <input type="color" id="bgColor" class="control-color" value="#ffffff">
                            </div>
                            <div class="control-group">
                                <label class="control-label">Font</label>
                                <select id="fontFamily" class="control-select" style="width: 80px;">
                                    <option value="Inter">Inter</option>
                                    <option value="IBM Plex Serif">Serif</option>
                                    <option value="monospace">Mono</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('input', processAllData);
                el.addEventListener('change', processAllData);
            });
            
            updatePieInputs();
        }

        function updatePieInputs() {
            updatePieColorInputs();
        }

        function updatePieColorInputs() {
            const track = document.getElementById('pieColorTrack');
            if (!track) return;

            const dataCount = document.querySelectorAll('#IndependentVarsInput .var-box').length;
            while (pieColors.length < dataCount) pieColors.push('#FFE01B');

            track.innerHTML = '';
            pieColors.forEach((color, i) => {
                const picker = document.createElement('input');
                picker.type = 'color';
                picker.className = 'var-box';
                picker.style.cssText = "padding: 0; width: 30px; height: 30px; flex: 0 0 30px; cursor: pointer;";
                picker.value = color;
                picker.oninput = (e) => { pieColors[i] = e.target.value; processAllData(); };
                track.appendChild(picker);
            });

            const addBtn = document.createElement('button');
            addBtn.className = 'var-box load-more-btn';
            addBtn.innerText = '+';
            addBtn.style.cssText = "padding: 0; width: 30px; height: 30px; flex: 0 0 30px; cursor: pointer; display: flex; align-items: center; justify-content: center;";
            addBtn.onclick = () => { pieColors.push('#FFE01B'); updatePieInputs(); processAllData(); setTimeout(() => track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' }), 10); };
            track.appendChild(addBtn);
        }

        // ============================================
        // SHOW/HIDE TYPE-SPECIFIC SECTIONS
        // ============================================
        function updateTypeSpecificSections(type) {
            document.querySelectorAll('.type-specific-section').forEach(section => {
                const sectionTypes = section.dataset.type.split(',');
                section.classList.toggle('active', sectionTypes.includes(type));
            });
        }

        // ============================================
        // SECTION COLLAPSE/EXPAND
        // ============================================
        window.toggleSection = (contentId) => {
            const content = document.getElementById(contentId);
            const header = content.previousElementSibling;
            content.classList.toggle('hidden');
            header.classList.toggle('collapsed');
        };

        // ============================================
        // NUMBER STEPPER
        // ============================================
        window.stepNumber = (inputId, step) => {
            const input = document.getElementById(inputId);
            let value = parseInt(input.value) || 0;
            const min = parseInt(input.min) || -Infinity;
            const max = parseInt(input.max) || Infinity;
            input.value = Math.min(max, Math.max(min, value + step));
            processAllData();
        };

        // ============================================
        // COLOR PALETTE
        // ============================================
        document.getElementById('colorPalette').addEventListener('click', (e) => {
            if (e.target.classList.contains('palette-color')) {
                document.querySelectorAll('.palette-color').forEach(c => c.classList.remove('selected'));
                e.target.classList.add('selected');
                processAllData();
            }
        });

        // ============================================
        // VARIABLE INPUT MODES
        // ============================================
        window.stepValue = (id, direction) => {
            const el = document.getElementById(id);
            direction === 'up' ? el.stepUp() : el.stepDown();
            processAllData();
        };

        window.toggleIndyMode = (isRange) => {
            if (isRange) {
                indyTrack.innerHTML = `
                    <div class="range-inputs">
                        <div class="brutalist-num-input">
                            <button onclick="stepValue('rMinX','down')">-</button>
                            <input type="number" id="rMinX" value="0" oninput="processAllData()">
                            <button onclick="stepValue('rMinX','up')">+</button>
                        </div>
                        <span>TO</span>
                        <div class="brutalist-num-input">
                            <button onclick="stepValue('rMaxX','down')">-</button>
                            <input type="number" id="rMaxX" value="10" oninput="processAllData()">
                            <button onclick="stepValue('rMaxX','up')">+</button>
                        </div>
                    </div>`;
            } else {
                indyTrack.innerHTML = "";
                addBoxes(3, 'indy');
            }
        };

        window.toggleDepMode = (isRange) => {
            if (isRange) {
                depTrack.innerHTML = `
                    <div class="range-inputs">
                        <div class="brutalist-num-input">
                            <button onclick="stepValue('rMinY','down')">-</button>
                            <input type="number" id="rMinY" value="0" oninput="processAllData()">
                            <button onclick="stepValue('rMinY','up')">+</button>
                        </div>
                        <span>TO</span>
                        <div class="brutalist-num-input">
                            <button onclick="stepValue('rMaxY','down')">-</button>
                            <input type="number" id="rMaxY" value="100" oninput="processAllData()">
                            <button onclick="stepValue('rMaxY','up')">+</button>
                        </div>
                    </div>`;
            } else {
                depTrack.innerHTML = "";
                addBoxes(3, 'dep');
            }
        };

        // ============================================
        // DYNAMIC BOX GENERATION
        // ============================================
        function addBoxes(count = 3, target = 'both') {
            for (let i = 0; i < count; i++) {
                if (target === 'both' || target === 'indy') {
                    const iBox = document.createElement('input');
                    iBox.className = 'var-box';
                    iBox.addEventListener('input', processAllData);
                    indyTrack.appendChild(iBox);
                }
                if (target === 'both' || target === 'dep') {
                    const dBox = document.createElement('input');
                    dBox.className = 'var-box';
                    dBox.type = "number";
                    dBox.addEventListener('input', processAllData);
                    depTrack.appendChild(dBox);
                }
            }
            updateBarColorInputs();
            updateLoadButtons();
            updateLineColorInputs();
            updatePieInputs();
        }

        function updateLoadButtons() {
            document.querySelectorAll('.load-more-btn').forEach(b => b.remove());
            if (!document.getElementById('indyToggle').checked) indyTrack.appendChild(createBtn('indy'));
            if (!document.getElementById('depToggle').checked) depTrack.appendChild(createBtn('dep'));
        }

        function createBtn(target) {
            const btn = document.createElement('button');
            btn.className = 'var-box load-more-btn';
            btn.innerText = '»';
            btn.onclick = () => {
                addBoxes(3, target);
                const track = target === 'indy' ? indyTrack : depTrack;
                track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
            };
            return btn;
        }

        // ============================================
        // LINE CONTROLS
        // ============================================
        function createControlBar() {
            const container = document.createElement('div');
            container.id = 'lineControlBar';
            container.style.cssText = "display: flex; justify-content: center; gap: 12px; margin-top: 12px; align-items: center;";

            const prevBtn = document.createElement('button');
            prevBtn.id = 'btn-prev-line';
            prevBtn.innerText = "<<";
            prevBtn.style.cssText = "background: transparent; border: none; color: var(--caviar); font-size: 12px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px; visibility: hidden;";
            prevBtn.onmouseover = () => prevBtn.style.color = "var(--banana)";
            prevBtn.onmouseout = () => prevBtn.style.color = "var(--caviar)";
            prevBtn.onclick = () => navigateLine(-1);

            const removeBtn = document.createElement('button');
            removeBtn.innerText = "remove line";
            removeBtn.style.cssText = "background: transparent; border: none; color: var(--caviar); font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;";
            removeBtn.onmouseover = () => removeBtn.style.color = "var(--banana)";
            removeBtn.onmouseout = () => removeBtn.style.color = "var(--caviar)";
            removeBtn.onclick = removeCurrentLine;

            const updateBtn = document.createElement('button');
            updateBtn.innerText = "[Update]";
            updateBtn.style.cssText = "background: var(--caviar); color: var(--nimbus); border: none; padding: 6px 10px; font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;";
            updateBtn.onmouseover = () => { updateBtn.style.background = "var(--banana)"; updateBtn.style.color = "var(--caviar)"; };
            updateBtn.onmouseout = () => { updateBtn.style.background = "var(--caviar)"; updateBtn.style.color = "var(--nimbus)"; };
            updateBtn.onclick = processAllData;

            const addBtn = document.createElement('button');
            addBtn.innerText = "add line[+]";
            addBtn.style.cssText = "background: transparent; border: none; color: var(--caviar); font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;";
            addBtn.onmouseover = () => addBtn.style.color = "var(--banana)";
            addBtn.onmouseout = () => addBtn.style.color = "var(--caviar)";
            addBtn.onclick = handleAddLine;

            const nextBtn = document.createElement('button');
            nextBtn.id = 'btn-next-line';
            nextBtn.innerText = ">>";
            nextBtn.style.cssText = "background: transparent; border: none; color: var(--caviar); font-size: 12px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px; visibility: hidden;";
            nextBtn.onmouseover = () => nextBtn.style.color = "var(--banana)";
            nextBtn.onmouseout = () => nextBtn.style.color = "var(--caviar)";
            nextBtn.onclick = () => navigateLine(1);

            container.appendChild(prevBtn);
            container.appendChild(removeBtn);
            container.appendChild(updateBtn);
            container.appendChild(addBtn);
            container.appendChild(nextBtn);

            const depSection = depTrack.closest('.var-section');
            if (depSection && depSection.parentNode) {
                depSection.parentNode.insertBefore(container, depSection.nextSibling);
            }
        }

        function updateNavButtons() {
            const prev = document.getElementById('btn-prev-line');
            const next = document.getElementById('btn-next-line');
            if (prev) prev.style.visibility = currentLineIndex > 0 ? 'visible' : 'hidden';
            if (next) next.style.visibility = currentLineIndex < datasets.length - 1 ? 'visible' : 'hidden';
        }

        function navigateLine(direction) {
            saveCurrentLine();
            const newIndex = currentLineIndex + direction;
            
            if (newIndex < 0 || newIndex >= datasets.length) return;
            
            currentLineIndex = newIndex;
            loadLine(currentLineIndex);
            updateNavButtons();
        }

        function loadLine(index) {
            const data = datasets[index];
            if (!data) return;

            // Clear and Rebuild Inputs
            indyTrack.innerHTML = '';
            depTrack.innerHTML = '';
            
            const count = data.x.length || 3;
            addBoxes(count);

            const xBoxes = indyTrack.querySelectorAll('.var-box');
            const yBoxes = depTrack.querySelectorAll('.var-box');

            data.x.forEach((val, i) => { if(xBoxes[i]) xBoxes[i].value = val; });
            data.y.forEach((val, i) => { if(yBoxes[i]) yBoxes[i].value = val; });

            // Restore Line Specific Settings
            if (document.getElementById('datasetName')) document.getElementById('datasetName').value = data.label || '';
            if (document.getElementById('lineThickness')) document.getElementById('lineThickness').value = data.thickness || '2';
            if (document.getElementById('lineTension')) document.getElementById('lineTension').value = data.tension || '40';
            if (document.getElementById('lineStepped')) document.getElementById('lineStepped').checked = data.stepped || false;
            if (document.getElementById('lineDashed')) document.getElementById('lineDashed').checked = data.dashed || false;
            if (document.getElementById('linePointShape')) document.getElementById('linePointShape').value = data.pointShape || 'circle';
            if (document.getElementById('linePointSize')) document.getElementById('linePointSize').value = data.pointSize || '4';
            if (document.getElementById('lineShowPoints')) document.getElementById('lineShowPoints').checked = data.showPoints ?? true;

            showLineOverlay(index + 1);
            processAllData();
            updateBarColorInputs();
            updateLineColorInputs();
            updatePieInputs();
        }

        function handleAddLine() {
            saveCurrentLine();
            currentLineIndex = datasets.length; // Always jump to end for new line
            showLineOverlay(currentLineIndex + 1);
            
            // Reset UI for new line
            indyTrack.innerHTML = '';
            depTrack.innerHTML = '';
            addBoxes(3);
            
            saveCurrentLine(); // Save the new blank line so it counts towards length
            processAllData();
            updateNavButtons();
            updateLineColorInputs();
            updatePieInputs();
            resetLineSpecificSettings();
        }

        function saveCurrentLine() {
            const xVals = Array.from(indyTrack.querySelectorAll('.var-box')).map(i => i.value);
            const yVals = Array.from(depTrack.querySelectorAll('.var-box')).map(i => i.value);

            const styleSettings = {
                label: document.getElementById('datasetName')?.value || '',
                thickness: document.getElementById('lineThickness')?.value || '2',
                tension: document.getElementById('lineTension')?.value || '40',
                stepped: document.getElementById('lineStepped')?.checked || false,
                dashed: document.getElementById('lineDashed')?.checked || false,
                pointShape: document.getElementById('linePointShape')?.value || 'circle',
                pointSize: document.getElementById('linePointSize')?.value || '4',
                showPoints: document.getElementById('lineShowPoints')?.checked ?? true
            };
            
            datasets[currentLineIndex] = { x: xVals, y: yVals, ...styleSettings };
        }

        function resetLineSpecificSettings() {
            // 1. Define elements to reset and their default values
            const settingsToReset = [
                { id: 'datasetName', value: '', type: 'value' },
                { id: 'lineThickness', value: '2', type: 'value' },
                { id: 'lineTension', value: '40', type: 'value' },
                { id: 'lineStepped', value: false, type: 'checked' },
                { id: 'lineDashed', value: false, type: 'checked' },
                { id: 'linePointShape', value: 'circle', type: 'value' },
                { id: 'linePointSize', value: '4', type: 'value' },
                { id: 'lineShowPoints', value: true, type: 'checked' }
            ];

            // 2. Reset Inputs and Flash
            settingsToReset.forEach(setting => {
                const el = document.getElementById(setting.id);
                if (el) {
                    flashElement(el.closest('.control-group') || el);
                    if (setting.type === 'checked') el.checked = setting.value;
                    else el.value = setting.value;
                }
            });

            // 3. Handle Line Color (Special Case: Flash the new picker)
            const colorTrack = document.getElementById('lineColorTrack');
            if (colorTrack) {
                const pickers = colorTrack.querySelectorAll('input[type="color"]');
                const lastPicker = pickers[pickers.length - 1];
                if (lastPicker) {
                    flashElement(lastPicker);
                    // Ensure default color is set in state if needed, though updateLineColorInputs handles defaults
                }
            }
        }

        function flashElement(element) {
            const rect = element.getBoundingClientRect();
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                background: var(--banana);
                opacity: 0.8;
                z-index: 9999;
                pointer-events: none;
                transition: opacity 0.4s ease-out;
            `;
            document.body.appendChild(overlay);
            
            requestAnimationFrame(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 400);
            });
        }

        function showLineOverlay(lineNum) {
            const indySection = indyTrack.closest('.var-section');
            const depSection = depTrack.closest('.var-section');
            if (!indySection || !depSection) return;

            const overlay = document.createElement('div');
            overlay.innerText = `LINE ${lineNum}`;
            overlay.style.cssText = "position: fixed; background: rgba(36, 28, 21, 0.95); color: var(--banana); display: flex; justify-content: center; align-items: center; font-family: 'IBM Plex Serif', serif; font-size: 32px; font-weight: 800; text-transform: uppercase; z-index: 1000; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; border: 4px solid var(--banana);";

            const r1 = indySection.getBoundingClientRect();
            const r2 = depSection.getBoundingClientRect();
            const top = Math.min(r1.top, r2.top);
            const left = Math.min(r1.left, r2.left);
            const width = Math.max(r1.right, r2.right) - left;
            const height = Math.max(r1.bottom, r2.bottom) - top;

            overlay.style.top = `${top}px`;
            overlay.style.left = `${left}px`;
            overlay.style.width = `${width}px`;
            overlay.style.height = `${height}px`;

            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.remove(), 300);
                }, 600);
            });
        }

        function removeCurrentLine() {
            if (currentLineIndex === 0) return; // Never delete the first line
            
            datasets.splice(currentLineIndex, 1);
            currentLineIndex--;

            // Remove corresponding color
            lineColors.splice(currentLineIndex, 1);
            
            loadLine(currentLineIndex);
            updateNavButtons();
        }

        // ============================================
        // COLLECT ALL SETTINGS
        // ============================================
        function collectSettings() {
            const isDoughnut = document.getElementById('pieDoughnut')?.checked;
            
            // Collect Data
            const currentX = Array.from(indyTrack.querySelectorAll('.var-box')).map(i => i.value);
            const currentY = Array.from(depTrack.querySelectorAll('.var-box')).map(i => i.value);
            
            const currentStyle = {
                label: document.getElementById('datasetName')?.value || '',
                thickness: document.getElementById('lineThickness')?.value || '2',
                tension: document.getElementById('lineTension')?.value || '40',
                stepped: document.getElementById('lineStepped')?.checked || false,
                dashed: document.getElementById('lineDashed')?.checked || false,
                pointShape: document.getElementById('linePointShape')?.value || 'circle',
                pointSize: document.getElementById('linePointSize')?.value || '4',
                showPoints: document.getElementById('lineShowPoints')?.checked ?? true
            };

            const allDatasets = [...datasets];
            allDatasets[currentLineIndex] = { x: currentX, y: currentY, ...currentStyle };

            return {
                type: isDoughnut && currentGraphType === 'pie' ? 'doughnut' : currentGraphType,
                data: allDatasets,
                global: {
                    datasetName: document.getElementById('datasetName')?.value || '',
                    valueSource: document.getElementById('valueSource')?.value || 'manual',
                    sortOrder: document.getElementById('sortOrder')?.value || 'original',
                    bgColor: document.getElementById('bgColor')?.value || '#ffffff',
                    fontFamily: document.getElementById('fontFamily')?.value || 'Inter',
                    legendPosition: document.getElementById('legendPosition')?.value || 'top',
                    showLegend: document.getElementById('showLegend')?.checked ?? true,
                    showTitle: document.getElementById('showTitle')?.checked ?? true,
                    showTooltips: document.getElementById('showTooltips')?.checked ?? true,
                    hoverHighlight: document.getElementById('hoverHighlight')?.checked ?? true,
                    responsive: document.getElementById('responsive')?.checked ?? true,
                    selectedColor: document.querySelector('.palette-color.selected')?.dataset.color || '#ff007a'
                },
                bar: {
                    colors: [...barColors],
                    thickness: document.getElementById('barThickness')?.value || 30,
                    spacing: document.getElementById('barSpacing')?.value || 10,
                    stacked: document.getElementById('barStacked')?.checked ?? false,
                    orientation: document.getElementById('barOrientation')?.value || 'vertical',
                    showXAxis: document.getElementById('barShowXAxis')?.checked ?? true,
                    showYAxis: document.getElementById('barShowYAxis')?.checked ?? true,
                    gridlines: document.getElementById('barGridlines')?.checked ?? true,
                    tickRotation: document.getElementById('barTickRotation')?.value || '0',
                    borderRadius: document.getElementById('barBorderRadius')?.value || 0,
                    borderWidth: document.getElementById('barBorderWidth')?.value || 1,
                    fillOpacity: document.getElementById('barFillOpacity')?.value || 80,
                    minValue: document.getElementById('barMinValue')?.value || null,
                    maxValue: document.getElementById('barMaxValue')?.value || null
                },
                line: {
                    colors: [...lineColors],
                    thickness: document.getElementById('lineThickness')?.value || 2,
                    tension: (document.getElementById('lineTension')?.value || 40) / 100,
                    stepped: document.getElementById('lineStepped')?.checked ?? false,
                    dashed: document.getElementById('lineDashed')?.checked ?? false,
                    showPoints: document.getElementById('lineShowPoints')?.checked ?? true,
                    pointSize: document.getElementById('linePointSize')?.value || 4,
                    pointShape: document.getElementById('linePointShape')?.value || 'circle',
                    fill: document.getElementById('lineFill')?.checked ?? false,
                    fillOpacity: document.getElementById('lineFillOpacity')?.value || 30,
                    gradient: document.getElementById('lineGradient')?.checked ?? false,
                    gridlines: document.getElementById('lineGridlines')?.checked ?? true,
                    minValue: document.getElementById('lineMinValue')?.value || null,
                    maxValue: document.getElementById('lineMaxValue')?.value || null
                },
                pie: {
                    colors: [...pieColors],
                    showKeys: document.getElementById('pieShowKeys')?.checked ?? true,
                    isDoughnut: document.getElementById('pieDoughnut')?.checked ?? false,
                    innerRadius: document.getElementById('pieInnerRadius')?.value || 0,
                    spacing: document.getElementById('pieSpacing')?.value || 0,
                    rotation: document.getElementById('pieRotation')?.value || 0,
                    showPercent: document.getElementById('pieShowPercent')?.checked ?? true,
                    showValue: document.getElementById('pieShowValue')?.checked ?? false,
                    showLabel: document.getElementById('pieShowLabel')?.checked ?? true,
                    labelPosition: document.getElementById('pieLabelPosition')?.value || 'inside',
                    borderWidth: document.getElementById('pieBorderWidth')?.value || 2,
                    borderColor: document.getElementById('pieBorderColor')?.value || '#ffffff',
                    hoverOffset: document.getElementById('pieHoverOffset')?.value || 10,
                    explode: document.getElementById('pieExplode')?.checked ?? true,
                    sortByValue: document.getElementById('pieSortByValue')?.checked ?? false
                }
            };
        }

        // ============================================
        // PROCESS DATA
        // ============================================
        window.processAllData = () => {
            const settings = collectSettings();
            console.log("📊 Settings:", settings);
        };

        // ============================================
        // LISTENERS
        // ============================================
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', processAllData);
            input.addEventListener('input', processAllData);
        });

        // Doughnut toggle updates inner radius visibility
        document.getElementById('pieDoughnut')?.addEventListener('change', (e) => {
            const slider = document.getElementById('pieInnerRadius');
            if (e.target.checked) {
                slider.value = 50;
            } else {
                slider.value = 0;
            }
            processAllData();
        });

        // ============================================
        // INIT
        // ============================================
        addBoxes(3);
        createControlBar();

        // Remove Radar artifacts from DOM if present
        document.querySelectorAll('.dropdown-content a').forEach(a => {
            if (a.textContent.includes('Radar') || a.getAttribute('onclick')?.includes('radar')) {
                a.remove();
            }
        });
        const radarSection = document.querySelector('.type-specific-section[data-type="radar"]');
        if (radarSection) radarSection.remove();

        window.setGraphType('line');
        console.log("✅ Graph Settings Ready!");

        
}