// Track selected node for content menu
let selectedCanvasNode = null;

export function getSelectedCanvasNode() {
    return selectedCanvasNode;
}

// Helper to load HTML components
async function loadComponent(target, file) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const html = await res.text();
        const targetElement = (typeof target === 'string') ? document.getElementById(target) : target;
        if (targetElement) targetElement.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

export function initCanvas(container) {
    // --- STATE ---
    let scale = 1;
    let pan = { x: 0, y: 0 };
    let mode = 'move'; // 'move' or 'connect'
    let connections = []; // { from: element, to: element, path: svgElement }
    
    // Drag state - scoped to this canvas instance
    let isDragging = false;
    let dragTarget = null;
    let startPos = { x: 0, y: 0 };
    let tempPath = null;
    let connectStartNode = null;
    
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
        
        // Make blocks resizable
        box.style.resize = 'both';
        box.style.overflow = 'auto';
        
        // Calculate center of screen in world coordinates
        const centerX = (viewport.offsetWidth / 2 - pan.x) / scale;
        const centerY = (viewport.offsetHeight / 2 - pan.y) / scale;
        
        box.style.left = (centerX - 75) + 'px';
        box.style.top = (centerY - 50) + 'px';
        
        box.setAttribute('tabindex', '0');
        world.appendChild(box);
    }

    function spawnSection() {
        const section = document.createElement('div');
        section.className = 'node-canvas section-node-canvas';
        
        // Make it look like the TextBox interactive-box
        Object.assign(section.style, {
            width: '300px',
            height: '200px',
            minWidth: '200px',
            minHeight: '150px',
            background: 'white',
            border: '2px solid black',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            resize: 'both',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            position: 'absolute'
        });
        
        // Create a drag handle at the top
        const dragHandle = document.createElement('div');
        dragHandle.className = 'section-drag-handle';
        Object.assign(dragHandle.style, {
            width: '100%',
            height: '24px',
            background: 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)',
            borderBottom: '1px solid #ccc',
            cursor: 'grab',
            flexShrink: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        // Add grip dots
        dragHandle.innerHTML = '<span style="color: #999; font-size: 10px; letter-spacing: 2px;">• • •</span>';
        
        // Create content area (like .content in interactive-box)
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        Object.assign(contentDiv.style, {
            flex: '1',
            width: '100%',
            padding: '10px',
            boxSizing: 'border-box',
            overflow: 'auto',
            fontFamily: '"IBM Plex Serif", serif',
            fontSize: '16px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
        });
        contentDiv.innerHTML = '<span style="color: #999;">Click [+] to add content...</span>';
        
        // Create section tools (like .SectionTools)
        const sectionTools = document.createElement('div');
        sectionTools.className = 'SectionTools';
        Object.assign(sectionTools.style, {
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            zIndex: '100',
            display: 'flex',
            gap: '8px',
            opacity: '0',
            transition: 'opacity 0.2s'
        });
        
        // Add Content button
        const addBtn = document.createElement('button');
        addBtn.className = 'ContentType';
        addBtn.innerHTML = '[+] Add Content';
        Object.assign(addBtn.style, {
            background: '#ff007a',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '11px',
            textTransform: 'uppercase',
            transition: 'all 0.2s'
        });
        
        addBtn.addEventListener('mouseenter', () => {
            addBtn.style.background = '#d9006a';
            addBtn.style.transform = 'translateY(-2px)';
        });
        addBtn.addEventListener('mouseleave', () => {
            addBtn.style.background = '#ff007a';
            addBtn.style.transform = 'translateY(0)';
        });
        
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            selectedCanvasNode = section;
            loadChooseMenu(section);
        });
        
        sectionTools.appendChild(addBtn);
        
        // Show/hide tools on hover
        section.addEventListener('mouseenter', () => {
            sectionTools.style.opacity = '1';
        });
        section.addEventListener('mouseleave', () => {
            sectionTools.style.opacity = '0';
        });
        
        // Assemble section
        section.appendChild(dragHandle);
        section.appendChild(contentDiv);
        section.appendChild(sectionTools);
        
        // Calculate center of screen in world coordinates
        const centerX = (viewport.offsetWidth / 2 - pan.x) / scale;
        const centerY = (viewport.offsetHeight / 2 - pan.y) / scale;
        
        section.style.left = (centerX - 150) + 'px'; 
        section.style.top = (centerY - 100) + 'px';
        
        section.setAttribute('tabindex', '0');
        world.appendChild(section);
        
        return section;
    }

    // Load the choose content menu
    async function loadChooseMenu(targetSection) {
        try {
            // Remove existing menu if present
            const existingMenu = document.getElementById("ContentBox");
            if (existingMenu) {
                existingMenu.remove();
            }

            const menuContainer = document.createElement("div");
            menuContainer.className = "floating-node";
            menuContainer.id = "ContentBox";
            
            Object.assign(menuContainer.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '10000',
                cursor: 'grab',
                background: '#f5f5f3',
                borderRadius: '1rem',
                border: '2px solid black',
                overflow: 'hidden'
            });
            
            document.body.appendChild(menuContainer);
            await loadComponent(menuContainer, "/Components/chooseContentType.html");
            
            // Set the canvas selected node for the content menu
            window._canvasSelectedNode = targetSection;
            
            // Dynamically import and call getContentInfo
            const chooseModule = await import("/Components/chooseContentType.js");
            chooseModule.getContentInfo();

            // Make menu draggable
            let isDraggingMenu = false, menuStartX, menuStartY, menuInitialX, menuInitialY;
            
            menuContainer.addEventListener("mousedown", (e) => {
                if (e.target.closest('button') || e.target.closest('input') || e.target.closest('li')) return;
                isDraggingMenu = true;
                menuContainer.style.cursor = 'grabbing';
                
                const rect = menuContainer.getBoundingClientRect();
                menuContainer.style.transform = 'none';
                menuContainer.style.left = rect.left + "px";
                menuContainer.style.top = rect.top + "px";
                
                menuStartX = menuContainer.offsetLeft;
                menuStartY = menuContainer.offsetTop;
                menuInitialX = e.clientX;
                menuInitialY = e.clientY;
                
                e.preventDefault();
                e.stopPropagation();
            });
            
            document.addEventListener("mousemove", function menuMove(me) {
                if (!isDraggingMenu) return;
                menuContainer.style.left = `${menuStartX + (me.clientX - menuInitialX)}px`;
                menuContainer.style.top = `${menuStartY + (me.clientY - menuInitialY)}px`;
            });
            
            document.addEventListener("mouseup", function menuUp() {
                isDraggingMenu = false;
                if (menuContainer) menuContainer.style.cursor = 'grab';
            });

        } catch (err) {
            console.error("Load Error:", err);
        }
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
        
        const track = container.querySelector('#toggle-track-canvas') || document.getElementById('toggle-track-canvas');
        const optMove = container.querySelector('#opt-move-canvas') || document.getElementById('opt-move-canvas');
        const optConnect = container.querySelector('#opt-connect-canvas') || document.getElementById('opt-connect-canvas');
        
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

    // --- HELPER FUNCTIONS ---
    function getLocalPos(e) {
        const rect = viewport.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    
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

    // --- MOUSEDOWN HANDLER ---
    viewport.addEventListener('mousedown', e => {
        // Ignore UI clicks
        if (e.target.tagName === 'BUTTON') return;
        if (e.target.closest('.SectionTools')) return;
        
        const node = e.target.closest('.node-canvas');
        
        // Allow text editing without dragging
        if (node && e.target.isContentEditable) return;
        
        // For section nodes - only drag from the handle
        if (mode === 'move' && node && node.classList.contains('section-node-canvas')) {
            const dragHandle = e.target.closest('.section-drag-handle');
            const content = node.querySelector('.content');
            
            // If clicking content area, don't drag
            if (content && content.contains(e.target)) {
                return;
            }
            
            // Only drag if clicking the drag handle
            if (!dragHandle) {
                return;
            }
        }

        // For generic nodes, check if clicking the resize handle (bottom-right corner)
        if (mode === 'move' && node && !node.classList.contains('section-node-canvas')) {
            const rect = node.getBoundingClientRect();
            if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) {
                return; // Allow resize, don't drag
            }
        }

        startPos = getLocalPos(e);

        if (mode === 'move') {
            if (node) {
                node.focus();
                isDragging = true;
                dragTarget = node;
                dragTarget.dataset.startX = parseFloat(dragTarget.style.left) || 0;
                dragTarget.dataset.startY = parseFloat(dragTarget.style.top) || 0;
                e.preventDefault();
            } else {
                // Pan Canvas
                isDragging = true;
                dragTarget = 'canvas';
                viewport.dataset.startX = pan.x;
                viewport.dataset.startY = pan.y;
                e.preventDefault();
            }
        } else if (mode === 'connect' && node) {
            isDragging = true;
            connectStartNode = node;
            tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tempPath.setAttribute('stroke', '#007bff');
            tempPath.setAttribute('stroke-dasharray', '5,5');
            svgLayer.appendChild(tempPath);
            e.preventDefault();
        }
    });

    // --- MOUSEMOVE HANDLER (scoped to this canvas) ---
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        // Make sure we're still working with this canvas
        if (!canvasContainer.contains(e.target) && dragTarget !== 'canvas' && !dragTarget) {
            return;
        }

        const pos = getLocalPos(e);
        const dx = (pos.x - startPos.x) / scale;
        const dy = (pos.y - startPos.y) / scale;

        if (mode === 'move') {
            if (dragTarget === 'canvas') {
                pan.x = parseFloat(viewport.dataset.startX) + (pos.x - startPos.x);
                pan.y = parseFloat(viewport.dataset.startY) + (pos.y - startPos.y);
                updateTransform();
            } else if (dragTarget && dragTarget !== 'canvas') {
                const newLeft = parseFloat(dragTarget.dataset.startX) + dx;
                const newTop = parseFloat(dragTarget.dataset.startY) + dy;
                dragTarget.style.left = newLeft + 'px';
                dragTarget.style.top = newTop + 'px';
                updateConnections();
            }
        } else if (mode === 'connect' && tempPath && connectStartNode) {
            const startRect = connectStartNode.getBoundingClientRect();
            const viewRect = viewport.getBoundingClientRect();
            const sx = (startRect.left - viewRect.left + startRect.width/2 - pan.x) / scale;
            const sy = (startRect.top - viewRect.top + startRect.height/2 - pan.y) / scale;
            const mx = (pos.x - pan.x) / scale;
            const my = (pos.y - pan.y) / scale;
            
            tempPath.setAttribute('d', `M ${sx} ${sy} L ${mx} ${my}`);
        }
    };

    // --- MOUSEUP HANDLER ---
    const handleMouseUp = (e) => {
        if (!isDragging) return;
        
        if (mode === 'connect' && connectStartNode) {
            const targetNode = e.target.closest('.node-canvas');
            if (targetNode && targetNode !== connectStartNode) {
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
    };

    // Attach move/up to document but check if drag started in this canvas
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // --- WHEEL ZOOM (only when over canvas) ---
    let isMouseOverCanvas = false;
    
    canvasContainer.addEventListener('mouseenter', () => {
        isMouseOverCanvas = true;
    });
    
    canvasContainer.addEventListener('mouseleave', () => {
        isMouseOverCanvas = false;
    });
    
    canvasContainer.addEventListener('wheel', e => {
        if (!isMouseOverCanvas) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const zoomSpeed = 0.1;
        const newScale = scale + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed);
        if (newScale > 0.1 && newScale < 5) {
            scale = newScale;
            updateTransform();
        }
    }, { passive: false });
    
    // --- DELETE NODES ---
    const handleKeyDown = (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeEl = document.activeElement;
            if (activeEl && activeEl.classList.contains('node-canvas')) {
                // Don't delete if editing text
                if (activeEl.querySelector('[contenteditable="true"]')) {
                    return;
                }
                if (activeEl.isContentEditable) {
                    return;
                }
                
                e.preventDefault();

                connections = connections.filter(conn => {
                    if (conn.from === activeEl || conn.to === activeEl) {
                        conn.path.remove();
                        return false;
                    }
                    return true;
                });

                activeEl.remove();
            }
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    // --- Double click to edit ---
    viewport.addEventListener('dblclick', e => {
        const node = e.target.closest('.node-canvas');
        if (node) {
            // For section nodes, open the content menu
            if (node.classList.contains('section-node-canvas')) {
                // Only if double-clicking the content area or handle
                const content = node.querySelector('.content');
                if (content && content.contains(e.target)) {
                    selectedCanvasNode = node;
                    loadChooseMenu(node);
                }
                return;
            }
            
            // For regular nodes, enable text editing
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

    // Initialize with one box
    spawnShape('box');

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
            updateTransform();
        }
    };
}