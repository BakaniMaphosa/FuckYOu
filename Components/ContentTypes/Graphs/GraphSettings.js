
    const indyTrack = document.getElementById('IndependentVarsInput');
    const depTrack = document.getElementById('DependentVarsInput');
    const graphSettings = document.getElementById('GraphSettings');

    // --- GLOBAL EXPORTS FOR HTML ---
    // We attach these to window so the inline onclick/onchange in your HTML can see them
    
    window.setGraphType = (type) => {
        const btn = document.querySelector('.dropbtn');
        if (btn) {
            btn.innerHTML = `TYPE: ${type.toUpperCase()} <span>↓</span>`;
            // Quick visual feedback
            btn.style.backgroundColor = "black";
            btn.style.color = "white";
            setTimeout(() => { 
                btn.style.backgroundColor = ""; 
                btn.style.color = ""; 
            }, 150);
        }
    };

    window.stepValue = (id, direction) => {
        const el = document.getElementById(id);
        if (direction === 'up') el.stepUp();
        else el.stepDown();
        window.processAllData();
    };

    window.toggleIndyMode = (isRange) => {
        if (isRange) {
            indyTrack.innerHTML = `
                <div class="range-inputs">
                    <div class="brutalist-num-input">
                        <button onclick="window.stepValue('rMinX', 'down')">-</button>
                        <input type="number" id="rMinX" value="0" oninput="window.processAllData()">
                        <button onclick="window.stepValue('rMinX', 'up')">+</button>
                    </div>
                    <span>TO</span>
                    <div class="brutalist-num-input">
                        <button onclick="window.stepValue('rMaxX', 'down')">-</button>
                        <input type="number" id="rMaxX" value="10" oninput="window.processAllData()">
                        <button onclick="window.stepValue('rMaxX', 'up')">+</button>
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
                        <button onclick="window.stepValue('rMinY', 'down')">-</button>
                        <input type="number" id="rMinY" value="0" oninput="window.processAllData()">
                        <button onclick="window.stepValue('rMinY', 'up')">+</button>
                    </div>
                    <span>TO</span>
                    <div class="brutalist-num-input">
                        <button onclick="window.stepValue('rMaxY', 'down')">-</button>
                        <input type="number" id="rMaxY" value="100" oninput="window.processAllData()">
                        <button onclick="window.stepValue('rMaxY', 'up')">+</button>
                    </div>
                </div>`;
        } else {
            depTrack.innerHTML = "";
            addBoxes(3, 'dep');
        }
    };

    window.processAllData = () => {
        // This is where you'll eventually trigger the Chart.js update
        console.log("Processing graph data...");
    };

    /**
     * DYNAMIC BOX GENERATION
     */
    function addBoxes(count = 3, target = 'both') {
        for (let i = 0; i < count; i++) {
            if (target === 'both' || target === 'indy') {
                const iBox = document.createElement('input');
                iBox.className = 'var-box';
                iBox.addEventListener('input', window.processAllData);
                indyTrack.appendChild(iBox);
            }

            if (target === 'both' || target === 'dep') {
                const dBox = document.createElement('input');
                dBox.className = 'var-box';
                dBox.type = "number";
                dBox.addEventListener('input', window.processAllData);
                depTrack.appendChild(dBox);
            }
        }
        updateLoadButtons();
    }

    function updateLoadButtons() {
        // Clean up old buttons before adding new ones
        document.querySelectorAll('.load-more-btn').forEach(b => b.remove());

        if (!document.getElementById('indyToggle').checked) {
            indyTrack.appendChild(createBtn('indy'));
        }
        if (!document.getElementById('depToggle').checked) {
            depTrack.appendChild(createBtn('dep'));
        }
    }

    function createBtn(target) {
        const btn = document.createElement('button');
        btn.className = 'var-box load-more-btn';
        btn.innerText = '>>>';
        btn.onclick = () => {
            addBoxes(3, target);
            const track = target === 'indy' ? indyTrack : depTrack;
            track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
        };
        return btn;
    }

    // --- INITIALIZE COMPONENT ---
    addBoxes(3);
