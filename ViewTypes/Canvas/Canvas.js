export function initCanvas(container) {
    // --- STATE ---
    let scale = 1;
    let pan = { x: 0, y: 0 };
    let mode = 'move'; // 'move' or 'connect'
    let connections = []; // { from: element, to: element, path: svgElement }
    
    // --- DOM ELEMENTS ---
    const world = container.querySelector('#world-canvas') || document.getElementById('world-canvas');
    const viewport = container.querySelector('#viewport-canvas') || document.getElementById('viewport-canvas');
    const svgLayer = container.querySelector('#connections-canvas') || document.getElementById('connections-canvas');
    const canvasContainer = container.querySelector('#canvas-container-canvas') || document.getElementById('canvas-container-canvas');

    // --- CORE FUNCTIONS ---
    function updateTransform() {
        world.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
    }

    function spawnShape(type) {
        const box = document.createElement('div');
        box.className = `node-canvas ${type}-canvas`;
        box.innerHTML = `<div class="node-content-canvas">${type.charAt(0).toUpperCase() + type.slice(1)}</div>`;
        
        // Calculate center of screen in world coordinates
        const centerX = (viewport.offsetWidth / 2 - pan.x) / scale;
        const centerY = (viewport.offsetHeight / 2 - pan.y) / scale;
        
        box.style.left = (centerX - 75) + 'px'; // 75 is half width
        box.style.top = (centerY - 50) + 'px';  // 50 is half height
        
        box.setAttribute('tabindex', '0');
        world.appendChild(box);
    }

    function spawnSection() {
        const section = document.createElement('div');
        section.className = 'node-canvas';
        section.innerHTML = `<div class="node-content-canvas">Section</div>`;
        
        // Calculate center of screen in world coordinates
        const centerX = (viewport.offsetWidth / 2 - pan.x) / scale;
        const centerY = (viewport.offsetHeight / 2 - pan.y) / scale;
        
        section.style.left = (centerX - 100) + 'px'; 
        section.style.top = (centerY - 100) + 'px';
        section.style.width = '200px';
        section.style.height = '200px';
        
        section.setAttribute('tabindex', '0');
        world.appendChild(section);
    }

    function spawnText() {
        const text = document.createElement('div');
        text.className = 'node-canvas';
        text.innerHTML = `<div class="node-content-canvas" style="white-space: nowrap;">Double click to edit</div>`;
        text.style.background = 'transparent';
        text.style.border = 'none';
        text.style.boxShadow = 'none';
        text.style.width = 'auto';
        text.style.height = 'auto';
        text.style.padding = '10px';
        
        const centerX = (viewport.offsetWidth / 2 - pan.x) / scale;
        const centerY = (viewport.offsetHeight / 2 - pan.y) / scale;
        
        text.style.left = (centerX - 50) + 'px';
        text.style.top = (centerY - 20) + 'px';
        
        text.setAttribute('tabindex', '0');
        world.appendChild(text);
    }

    function toggleMode() {
        mode = mode === 'move' ? 'connect' : 'move';
        
        const track = document.getElementById('toggle-track-canvas');
        const optMove = document.getElementById('opt-move-canvas');
        const optConnect = document.getElementById('opt-connect-canvas');
        
        if (mode === 'connect') {
            track.style.transform = 'translateX(100%)';
            optMove.classList.remove('active-canvas');
            optConnect.classList.add('active-canvas');
            canvasContainer.classList.add('mode-connect-canvas');
        } else {
            track.style.transform = 'translateX(0)';
            optMove.classList.add('active-canvas');
            optConnect.classList.remove('active-canvas');
            canvasContainer.classList.remove('mode-connect-canvas');
        }
    }

    function resetView() {
        scale = 1; pan = { x: 0, y: 0 };
        updateTransform();
    }

    // --- INTERACTION LOGIC ---
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let dragTarget = null;
    let tempPath = null;
    let connectStartNode = null;

    function getLocalPos(e) {
        const rect = viewport.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    viewport.addEventListener('mousedown', e => {
        if (e.target.tagName === 'BUTTON') return; // Ignore UI clicks

        const node = e.target.closest('.node-canvas');
        
        // Allow text editing without dragging
        if (node && e.target.isContentEditable) return;

        startPos = getLocalPos(e);

        if (mode === 'move') {
            if (node) {
                node.focus(); // Ensure focus for deletion
                // Drag Node
                isDragging = true;
                dragTarget = node;
                dragTarget.dataset.startX = parseFloat(dragTarget.style.left);
                dragTarget.dataset.startY = parseFloat(dragTarget.style.top);
            } else {
                // Pan Canvas
                isDragging = true;
                dragTarget = 'canvas';
                viewport.dataset.startX = pan.x;
                viewport.dataset.startY = pan.y;
            }
        } else if (mode === 'connect' && node) {
            // Start Connection
            isDragging = true;
            connectStartNode = node;
            tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tempPath.setAttribute('stroke', '#007bff');
            tempPath.setAttribute('stroke-dasharray', '5,5');
            svgLayer.appendChild(tempPath);
        }
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;

        const pos = getLocalPos(e);
        const dx = (pos.x - startPos.x) / scale;
        const dy = (pos.y - startPos.y) / scale;

        if (mode === 'move') {
            if (dragTarget === 'canvas') {
                pan.x = parseFloat(viewport.dataset.startX) + (pos.x - startPos.x);
                pan.y = parseFloat(viewport.dataset.startY) + (pos.y - startPos.y);
                updateTransform();
            } else if (dragTarget) {
                dragTarget.style.left = (parseFloat(dragTarget.dataset.startX) + dx) + 'px';
                dragTarget.style.top = (parseFloat(dragTarget.dataset.startY) + dy) + 'px';
                updateConnections();
            }
        } else if (mode === 'connect' && tempPath) {
            const startRect = connectStartNode.getBoundingClientRect();
            const viewRect = viewport.getBoundingClientRect();
            // Calculate start point in world coords
            const sx = (startRect.left - viewRect.left + startRect.width/2 - pan.x) / scale;
            const sy = (startRect.top - viewRect.top + startRect.height/2 - pan.y) / scale;
            // Calculate current mouse point in world coords
            const mx = (pos.x - pan.x) / scale;
            const my = (pos.y - pan.y) / scale;
            
            tempPath.setAttribute('d', `M ${sx} ${sy} L ${mx} ${my}`);
        }
    });

    window.addEventListener('mouseup', e => {
        if (mode === 'connect' && isDragging) {
            const targetNode = e.target.closest('.node-canvas');
            if (targetNode && targetNode !== connectStartNode) {
                // Finalize connection
                const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                svgLayer.appendChild(newPath);
                connections.push({ from: connectStartNode, to: targetNode, path: newPath });
                updateConnections();
            }
            if (tempPath) tempPath.remove();
        }
        
        isDragging = false;
        dragTarget = null;
        connectStartNode = null;
        tempPath = null;
    });

    // --- HELPERS ---
    function updateConnections() {
        const viewRect = viewport.getBoundingClientRect();
        connections.forEach(conn => {
            const r1 = conn.from.getBoundingClientRect();
            const r2 = conn.to.getBoundingClientRect();
            
            const x1 = (r1.left - viewRect.left + r1.width/2 - pan.x) / scale;
            const y1 = (r1.top - viewRect.top + r1.height/2 - pan.y) / scale;
            const x2 = (r2.left - viewRect.left + r2.width/2 - pan.x) / scale;
            const y2 = (r2.top - viewRect.top + r2.height/2 - pan.y) / scale;
            
            conn.path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
        });
    }

    // --- FIX: Only handle wheel events when mouse is over the canvas ---
    let isMouseOverCanvas = false;
    
    canvasContainer.addEventListener('mouseenter', () => {
        isMouseOverCanvas = true;
    });
    
    canvasContainer.addEventListener('mouseleave', () => {
        isMouseOverCanvas = false;
    });
    
    window.addEventListener('wheel', e => {
        // Only zoom if mouse is actually over the canvas
        if (!isMouseOverCanvas) return;
        
        // Double-check: ensure the event target is inside the canvas container
        if (!canvasContainer.contains(e.target)) return;
        
        e.preventDefault();
        const zoomSpeed = 0.1;
        const newScale = scale + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed);
        if (newScale > 0.1 && newScale < 5) {
            scale = newScale;
            updateTransform();
        }
    }, { passive: false });
    
    // --- DELETE NODES ---
    document.addEventListener('keydown', e => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedNode = document.activeElement;
            if (selectedNode && selectedNode.classList.contains('node-canvas')) {
                e.preventDefault(); // Stop text deletion in node

                // Remove connections
                connections = connections.filter(conn => {
                    if (conn.from === selectedNode || conn.to === selectedNode) {
                        conn.path.remove();
                        return false;
                    }
                    return true;
                });

                // Remove the node itself
                selectedNode.remove();
            }
        }
    });

    // --- Prevent dragging text selections ---
    viewport.addEventListener('mousedown', e => {
        if (e.target.closest('.node-canvas') && !e.target.isContentEditable) {
            document.getSelection().removeAllRanges();
        }
    });

    // --- Double click to edit ---
    viewport.addEventListener('dblclick', e => {
        const node = e.target.closest('.node-canvas');
        if (node) {
            const content = node.querySelector('.node-content-canvas');
            if (content) {
                content.setAttribute('contenteditable', 'true');
                content.focus();
            }
        }
    });

    viewport.addEventListener('focusout', e => {
        if (e.target.classList.contains('node-content-canvas')) {
            e.target.removeAttribute('contenteditable');
        }
    });

    // Initialize
    spawnShape('box'); // Start with one box

    // --- EXPOSE FUNCTIONS TO WINDOW FOR HTML BUTTONS ---
    window.spawnShape = spawnShape;
    window.spawnSection = spawnSection;
    window.spawnText = spawnText;
    window.toggleMode = toggleMode;
    window.resetView = resetView;
    window.zoomIn = () => {
        if (scale < 5) {
            scale += 0.2;
            updateTransform();
        }
    };
    window.zoomOut = () => {
        if (scale > 0.2) {
            scale -= 0.2;
            updateTransform();git 
        }
    };
}