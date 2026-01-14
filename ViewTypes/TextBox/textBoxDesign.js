// ============================================
// FIXED FINAL VERSION: textBoxDesign.js
// Preserves HTML/styles by manipulating DOM directly
// ============================================

import { getContentInfo } from "/Components/chooseContentType.js";

let selectedNode = null;
let isDraggingGlobal = false;

// Track enter presses
let enterCount = 0;
let lastEnterBlock = null;
let lastEnterTime = 0;

export function getSelectedNode() {
  return selectedNode;
}

// ============================================
// HELPER: Load HTML Component
// ============================================
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

// ============================================
// REMOVE TRAILING EMPTY ELEMENTS (BR, empty DIV, nested empties)
// This preserves all styled content but removes line breaks
// ============================================
function removeTrailingEmpties(element, maxRemove = 30) {
  let removed = 0;
  let passes = 0;
  const maxPasses = 50; // Safety limit
  
  while (removed < maxRemove && passes < maxPasses) {
    passes++;
    
    if (!element.lastChild) break;
    
    const node = element.lastChild;
    
    // Remove <br>
    if (node.nodeName === 'BR') {
      node.remove();
      removed++;
      continue;
    }
    
    // Remove whitespace-only text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim() === '' || /^[\n\r\s]*$/.test(node.textContent)) {
        node.remove();
        continue;
      }
      // Has real text, stop
      break;
    }
    
    // For element nodes, check if they're effectively empty
    if (node.nodeType === Node.ELEMENT_NODE) {
      const inner = node.innerHTML;
      const text = node.textContent.trim();
      
      // Empty or just contains <br>
      if (inner === '' || inner === '<br>' || inner === '<br/>' || 
          inner.match(/^(<br\s*\/?>|\s)*$/) || text === '') {
        node.remove();
        removed++;
        continue;
      }
      
      // Check if it's a div/p/span that only contains empty children
      if (node.nodeName === 'DIV' || node.nodeName === 'P' || node.nodeName === 'SPAN') {
        // Recursively clean this node's trailing empties
        const beforeChildren = node.childNodes.length;
        removeTrailingEmpties(node, 10);
        
        // After cleaning, if it's now empty, remove it
        if (node.innerHTML.trim() === '' || node.innerHTML === '<br>' || 
            node.textContent.trim() === '') {
          node.remove();
          removed++;
          continue;
        }
        
        // If we removed children but element still has content, we're done with this level
        if (node.childNodes.length < beforeChildren) {
          continue; // Check again at parent level
        }
      }
      
      // Element has real content, stop
      break;
    }
    
    // Unknown node type, stop to be safe
    break;
  }
  
  console.log(`removeTrailingEmpties: removed ${removed} elements in ${passes} passes`);
  return removed;
}

// ============================================
// KEY DOWN HANDLER - Track enters
// ============================================
function handleKeyDown(e) {
  const block = e.currentTarget;
  const now = Date.now();
  
  if (e.key === 'Enter') {
    // Reset if different block or too long since last enter
    if (block !== lastEnterBlock || now - lastEnterTime > 2000) {
      enterCount = 0;
    }
    
    lastEnterBlock = block;
    lastEnterTime = now;
    enterCount++;
    
    console.log(`⏎ Enter #${enterCount}`);
    
    if (enterCount >= 2) {
      block.dataset.readyToSplit = 'true';
      block.dataset.enterCount = enterCount;
    }
  } 
  else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // Regular character
    if (block.dataset.readyToSplit === 'true') {
      e.preventDefault(); // Stop the character from being typed
      
      const storedEnterCount = parseInt(block.dataset.enterCount) || 2;
      console.log(`✅ SPLIT! Char: "${e.key}", Enters: ${storedEnterCount}`);
      
      // Calculate height
      const lineHeight = parseFloat(window.getComputedStyle(block).lineHeight) || 28;
      const height = Math.max(50, (storedEnterCount * lineHeight));
      
      // Create drop zone
      const dropZone = document.createElement('div');
      dropZone.className = 'drop-zone';
      dropZone.style.height = height + 'px';
      
      // Create new text block with the typed character
      const newBlock = document.createElement('div');
      newBlock.className = 'text-block';
      newBlock.contentEditable = 'true';
      newBlock.textContent = e.key;
      attachListeners(newBlock);
      
      // Clean up the ORIGINAL block - just remove trailing BRs/empty divs
      // DO NOT touch innerHTML or innerText - this preserves formatting!
      removeTrailingEmpties(block, storedEnterCount + 5);
      
      // Clear the flags
      delete block.dataset.readyToSplit;
      delete block.dataset.enterCount;
      
      // Insert the new elements
      block.after(dropZone);
      dropZone.after(newBlock);
      
      // Reset tracking
      enterCount = 0;
      lastEnterBlock = null;
      
      // Focus the new block
      setTimeout(() => {
        newBlock.focus();
        // Put cursor after the character
        const range = document.createRange();
        const sel = window.getSelection();
        if (newBlock.firstChild) {
          range.setStart(newBlock.firstChild, 1);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 0);
    } else {
      // Normal typing - reset enter count
      enterCount = 0;
      delete block.dataset.readyToSplit;
      delete block.dataset.enterCount;
    }
  }
  else if (e.key === 'Backspace' || e.key === 'Delete') {
    enterCount = 0;
    delete block.dataset.readyToSplit;
    delete block.dataset.enterCount;
  }
}

// ============================================
// ATTACH LISTENERS
// ============================================
function attachListeners(block) {
  block.addEventListener('keydown', handleKeyDown);
  console.log("✅ Listeners attached");
}

// ============================================
// DROP ZONE HEIGHT MANAGER
// ============================================
function updateDropZoneHeight(zone) {
  if (!zone || !zone.classList.contains('drop-zone')) return;
  const boxes = zone.querySelectorAll('.interactive-box');
  let maxBottom = 0;
  boxes.forEach(box => {
    const bottom = box.offsetTop + box.offsetHeight;
    if (bottom > maxBottom) maxBottom = bottom;
  });
  const currentHeight = parseFloat(zone.style.height) || zone.offsetHeight;
  const targetHeight = maxBottom + 20;
  if (targetHeight > currentHeight) zone.style.height = targetHeight + "px";
}

// ============================================
// COLLISION DETECTION
// ============================================
function checkCollision(box, newLeft, newTop, currentParent) {
  const pRect = currentParent.getBoundingClientRect();
  let finalLeft = Math.max(0, Math.min(newLeft, pRect.width - box.offsetWidth));
  let finalTop = Math.max(0, newTop);
  
  const siblings = Array.from(currentParent.querySelectorAll('.interactive-box')).filter(b => b !== box);
  for (let other of siblings) {
    const o = {
      left: other.offsetLeft,
      top: other.offsetTop,
      width: other.offsetWidth,
      height: other.offsetHeight
    };
    
    if (finalLeft < o.left + o.width && finalLeft + box.offsetWidth > o.left &&
        finalTop < o.top + o.height && finalTop + box.offsetHeight > o.top) {
      const overlapX = Math.min(finalLeft + box.offsetWidth - o.left, o.left + o.width - finalLeft);
      const overlapY = Math.min(finalTop + box.offsetHeight - o.top, o.top + o.height - finalTop);
      
      if (overlapX < overlapY) {
        finalLeft = (finalLeft < o.left) ? o.left - box.offsetWidth : o.left + o.width;
      } else {
        finalTop = (finalTop < o.top) ? o.top - box.offsetHeight : o.top + o.height;
      }
    }
  }
  return { left: finalLeft, top: finalTop };
}

// ============================================
// RESPONSIVE POSITIONING
// ============================================
function resolveProportionalOverflow(parent) {
  if (!parent || parent === document.body || isDraggingGlobal) return;
  const pRect = parent.getBoundingClientRect();
  
  parent.querySelectorAll('.interactive-box').forEach(box => {
    let hX = box.dataset.homeX ? parseFloat(box.dataset.homeX) : (box.offsetLeft / pRect.width * 100);
    let hY = box.dataset.homeY ? parseFloat(box.dataset.homeY) : (box.offsetTop / pRect.height * 100);
    
    const safe = checkCollision(box, (hX / 100) * pRect.width, (hY / 100) * pRect.height, parent);
    box.style.left = (safe.left / pRect.width * 100) + "%";
    box.style.top = (safe.top / pRect.height * 100) + "%";
  });
  
  updateDropZoneHeight(parent);
}

// ============================================
// DRAGGABLE LOGIC
// ============================================
function makeDraggable(box) {
  let isDragging = false, startX, startY;
  
  box.addEventListener('mousedown', (e) => {
    const clickedContent = e.target.closest('.interactive-box .content');
    if (clickedContent && clickedContent.parentElement === box) {
      if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) {
        return;
      }
    }
    
    if (e.target.closest('button')) {
      return;
    }
    
    const rect = box.getBoundingClientRect();
    if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) return;
    
    isDragging = true;
    isDraggingGlobal = true;
    box.style.cursor = 'grabbing';
    
    const pRect = box.parentElement.getBoundingClientRect();
    startX = e.clientX - (rect.left - pRect.left);
    startY = e.clientY - (rect.top - pRect.top);
    box.style.zIndex = "1000";
    
    deselectAll();
    selectedNode = box;
    box.classList.add('selected');
    
    e.preventDefault();
    e.stopPropagation();
  }, true);

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const safe = checkCollision(box, e.clientX - startX, e.clientY - startY, box.parentElement);
    box.style.left = safe.left + "px";
    box.style.top = safe.top + "px";
    updateDropZoneHeight(box.parentElement);
  });
  
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    isDraggingGlobal = false;
    box.style.cursor = 'grab';
    box.style.zIndex = "10";
    
    const pRect = box.parentElement.getBoundingClientRect();
    box.dataset.homeX = (box.offsetLeft / pRect.width * 100);
    box.dataset.homeY = (box.offsetTop / pRect.height * 100);
    resolveProportionalOverflow(box.parentElement);
  });
}

// ============================================
// DESELECT ALL
// ============================================
function deselectAll() {
  if (selectedNode) {
    selectedNode.classList.remove('selected');
    selectedNode = null;
  }
}

// ============================================
// RESIZE OBSERVER
// ============================================
let wallObserver = null;

function getWallObserver() {
  if (!wallObserver) {
    wallObserver = new ResizeObserver(entries => {
      if (isDraggingGlobal) return;
      for (let entry of entries) {
        const el = entry.target;
        if (el.classList.contains('interactive-box')) {
          updateDropZoneHeight(el.parentElement);
        } else {
          resolveProportionalOverflow(el);
        }
      }
    });
  }
  return wallObserver;
}

// ============================================
// INSERT INTERACTIVE BOX
// ============================================
function insertInteractiveBox(targetZone, contentType = 'section') {
  const box = document.createElement('div');
  box.className = 'interactive-box';
  box.style.cssText = `
    position: absolute;
    top: 10%;
    left: 10%;
    width: 300px;
    min-height: 150px;
    background: white;
    border: 2px solid black;
    border-radius: 8px;
    resize: both;
    overflow: hidden;
  `;
  box.dataset.homeX = "10";
  box.dataset.homeY = "10";
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  contentDiv.style.cssText = `
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  `;
  
  const sectionTools = document.createElement('div');
  sectionTools.className = 'SectionTools';
  sectionTools.style.cssText = `
    position: absolute;
    bottom: 5px;
    right: 5px;
    display: flex;
    gap: 5px;
    z-index: 100;
  `;
  
  sectionTools.innerHTML = `
    <button class="ContentType" style="background: #ff007a; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
      [+] Add Content
    </button>
  `;
  
  sectionTools.querySelector('.ContentType').onclick = (e) => {
    e.stopPropagation();
    selectedNode = box;
    loadChooseMenu();
  };
  
  box.appendChild(contentDiv);
  box.appendChild(sectionTools);
  targetZone.appendChild(box);
  
  makeDraggable(box);
  getWallObserver().observe(box);
  updateDropZoneHeight(targetZone);
  
  return box;
}

// ============================================
// LOAD CHOOSE MENU
// ============================================
async function loadChooseMenu() {
  try {
    if (document.getElementById("ContentBox")) return;

    const menuContainer = document.createElement("div");
    menuContainer.className = "floating-node";
    menuContainer.id = "ContentBox";
    
    Object.assign(menuContainer.style, {
      position: 'fixed',
      top: '40%',
      left: '40%',
      transform: 'translate(-50%, -50%)',
      zIndex: '10000',
      cursor: 'grab'
    });
    
    document.body.appendChild(menuContainer);
    await loadComponent(menuContainer, "/Components/chooseContentType.html");
    getContentInfo();

    let isDragging = false, startX, startY, initialMouseX, initialMouseY;
    
    menuContainer.addEventListener("mousedown", (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      isDragging = true;
      menuContainer.style.cursor = 'grabbing';
      
      const rect = menuContainer.getBoundingClientRect();
      menuContainer.style.transform = 'none';
      menuContainer.style.left = rect.left + "px";
      menuContainer.style.top = rect.top + "px";
      
      startX = menuContainer.offsetLeft;
      startY = menuContainer.offsetTop;
      initialMouseX = e.clientX;
      initialMouseY = e.clientY;
      
      const onMouseMove = (me) => {
        if (!isDragging) return;
        menuContainer.style.left = `${startX + (me.clientX - initialMouseX)}px`;
        menuContainer.style.top = `${startY + (me.clientY - initialMouseY)}px`;
      };
      
      const onMouseUp = () => {
        isDragging = false;
        menuContainer.style.cursor = 'grab';
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

  } catch (err) {
    console.error("Load Error:", err);
  }
}

// ============================================
// CONTEXT MENU SETUP
// ============================================
let contextMenuInitialized = false;

export function setupEditorContextMenu(editor, contextMenu, viewRegistry = {}) {
  if (contextMenu) contextMenu.style.display = "none";

  if (contextMenuInitialized) return;
  contextMenuInitialized = true;

  let lastClickZone = null;
  let clickedEditor = null;

  window.addEventListener("contextmenu", (e) => {
    const targetEditor = e.target.closest('#TextBox, #AIbox');
    if (targetEditor) {
      e.preventDefault();
      
      const isCanvasView = targetEditor.querySelector('#world-canvas');
      clickedEditor = targetEditor; // Set this for all actions

      if (isCanvasView) {
        // --- CANVAS CONTEXT MENU ---
        contextMenu.innerHTML = `
            <div class="menu-item" data-action="canvas-add-block" style="background: var(--banana)">Block</div>
            <div class="menu-item" data-action="split">Split View</div>
            <div class="menu-item has-submenu">
                View Type
                <div class="submenu">
                    <div class="submenu-item" data-action="view-TextBox">TextBox</div>
                    <div class="submenu-item" data-action="view-AIPanel">AI Panel</div>
                    <div class="submenu-item" data-action="view-Canvas">Canvas</div>
                </div>
            </div>
            <div class="menu-item" data-action="delete">Delete</div>
        `;
      } else {
        // --- TEXTBOX CONTEXT MENU ---
        const selection = window.getSelection();
        const hasSelection = selection.toString().length > 0 && targetEditor.contains(selection.anchorNode);

        if (hasSelection) {
          // Selection Menu: Copy, Cut, Paste
          contextMenu.innerHTML = `
              <div class="menu-item" data-action="copy">Copy</div>
              <div class="menu-item" data-action="cut">Cut</div>
              <div class="menu-item" data-action="paste">Paste</div>
          `;
        } else {
          // Standard Menu Logic
          let target = e.target;
          while (target && !target.classList.contains('drop-zone')) {
            target = target.parentElement;
            if (target === targetEditor) {
              target = null;
              break;
            }
          }
          lastClickZone = target;

          // Build Menu Items
          let menuItems = ``;
          
          if (lastClickZone) {
              menuItems += `
              <div class="menu-item has-submenu">
                  Insert
                  <div class="submenu">
                      <div class="submenu-section">Basic Tools</div>
                      <div class="submenu-item" data-action="Make-Section">Section</div>
                      <div class="submenu-item" data-action="insert-Image">Image</div>
                      <div class="submenu-item" data-action="insert-Table">Table</div>
                      <div class="submenu-item" data-action="insert-Graph">Graph</div>
                  </div>
              </div>`;
          }

          menuItems += `<div class="menu-item" data-action="split">Split View</div>`;

          if (!lastClickZone) {
              menuItems += `
              <div class="menu-item has-submenu">
                  View Type
                  <div class="submenu">
                      <div class="submenu-item" data-action="view-TextBox">TextBox</div>
                      <div class="submenu-item" data-action="view-AIPanel">AI Panel</div>
                      <div class="submenu-item" data-action="view-Canvas">Canvas</div>
                  </div>
              </div>`;
          }

          menuItems += `<div class="menu-item" data-action="delete">Delete</div>`;
          
          contextMenu.innerHTML = menuItems;
        }
      }
      
      contextMenu.style.display = "block";
      contextMenu.style.left = e.clientX + "px";
      contextMenu.style.top = e.clientY + "px";
    }
  }, true);

  document.addEventListener("mousedown", (e) => {
    if (!contextMenu.contains(e.target)) {
      contextMenu.style.display = "none";
    }
  });

  contextMenu.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    
    const action = target.getAttribute("data-action");

    // Canvas Action
    if (action === "canvas-add-block") {
        if (window.spawnShape) {
            window.spawnShape('box');
        }
        contextMenu.style.display = "none";
        return;
    }

    // Clipboard Actions
    if (action === "copy") {
        document.execCommand("copy");
        contextMenu.style.display = "none";
        return;
    }
    if (action === "cut") {
        document.execCommand("cut");
        contextMenu.style.display = "none";
        return;
    }
    if (action === "paste") {
        try {
            const text = await navigator.clipboard.readText();
            document.execCommand("insertText", false, text);
        } catch (err) {
            console.error("Paste failed:", err);
        }
        contextMenu.style.display = "none";
        return;
    }
    
    if (action === "Make-Section" && lastClickZone) {
      insertInteractiveBox(lastClickZone, 'section');
      contextMenu.style.display = "none";
    }

    if (action === "split") {
      createSplitView();
      contextMenu.style.display = "none";
    }

    if (action === "view-TextBox" && clickedEditor) {
      clickedEditor.id = "TextBox";
      clickedEditor.style.backgroundColor = "white";
      clickedEditor.style.display = "";
      clickedEditor.style.alignItems = "";
      clickedEditor.style.justifyContent = "";
      clickedEditor.innerHTML = `
        <div class="text-block" contenteditable="true">Press [Return] twice and type a letter to create a drop zone. Right-click to add sections!</div>
      `;
      const newBlock = clickedEditor.querySelector('.text-block');
      if (newBlock) attachListeners(newBlock);
      contextMenu.style.display = "none";
    }

    if (action === "view-AIPanel" && clickedEditor) {
      clickedEditor.id = "AIbox";
      
      // Clear inline styles so CSS #AIbox rules (width: 520px, etc.) can apply
      clickedEditor.style.width = "";
      clickedEditor.style.flex = "";

      clickedEditor.style.backgroundColor = "";
      clickedEditor.style.display = "";
      clickedEditor.style.alignItems = "";
      clickedEditor.style.justifyContent = "";
      
      await loadComponent(clickedEditor, "/ViewTypes/AIChat/aiChat.html");
      
      if (viewRegistry['view-AIPanel']) {
          viewRegistry['view-AIPanel'](clickedEditor);
      }
      
      contextMenu.style.display = "none";
    }

    if (action === "view-Canvas" && clickedEditor) {
      clickedEditor.style.backgroundColor = "";
      clickedEditor.style.display = "";
      clickedEditor.style.alignItems = "";
      clickedEditor.style.justifyContent = "";
      
      await loadComponent(clickedEditor, "/ViewTypes/Canvas/canvas.html");
      
      if (viewRegistry['view-Canvas']) {
          viewRegistry['view-Canvas'](clickedEditor);
      }
      
      contextMenu.style.display = "none";
    }

    if (action === "delete" && clickedEditor) {
      // Find adjacent divider to remove (try next, then prev)
      const next = clickedEditor.nextElementSibling;
      const prev = clickedEditor.previousElementSibling;
      
      clickedEditor.remove();

      if (next && (next.id === 'AIdivider' || next.style.cursor === 'col-resize')) {
        next.remove();
      } else if (prev && (prev.id === 'AIdivider' || prev.style.cursor === 'col-resize')) {
        prev.remove();
      }
      contextMenu.style.display = "none";
    }
  });
}

// ============================================
// MAIN SETUP FUNCTION
// ============================================
export function setupDivInsertion({ editor, contextMenu, viewRegistry = {} }) {
  if (!editor) {
    console.error("❌ Editor not found!");
    return;
  }

  const textBlocks = editor.querySelectorAll('.text-block');
  console.log(`Found ${textBlocks.length} text blocks`);
  
  textBlocks.forEach(block => {
    attachListeners(block);
  });
  
  const dropZones = editor.querySelectorAll('.drop-zone');
  const observer = getWallObserver();
  
  console.log(`Found ${dropZones.length} drop zones`);
  
  dropZones.forEach(zone => {
    observer.observe(zone);
    
    zone.querySelectorAll('.interactive-box').forEach(box => {
      makeDraggable(box);
      observer.observe(box);
      
      const addButton = box.querySelector('.ContentType');
      if (addButton) {
        addButton.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedNode = box;
          loadChooseMenu();
        });
      }
    });
  });
  
  observer.observe(editor);
  
  setupEditorContextMenu(editor, contextMenu, viewRegistry);
  
  const deleteHandler = (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
      if (e.target.tagName === "INPUT" || 
          e.target.tagName === "TEXTAREA" || 
          e.target.isContentEditable) {
        return;
      }
      e.preventDefault();
      selectedNode.remove();
      selectedNode = null;
    }
  };
  
  window.removeEventListener("keydown", deleteHandler);
  window.addEventListener("keydown", deleteHandler);
  
  document.addEventListener("mousedown", (e) => {
    if (e.target.closest('.floating-node')) return;
    if (e.target.closest('.context-menu')) return;
    
    if (!e.target.closest('.interactive-box')) {
      deselectAll();
    }
    else if (selectedNode && e.target.closest('.interactive-box') !== selectedNode) {
      deselectAll();
    }
  }, true);
  
  console.log("✅ Editor setup complete!");
}

// ============================================
// SPLIT VIEW LOGIC
// ============================================
function createSplitView() {
  const textBox = document.getElementById("TextBox");
  const aiBox = document.getElementById("AIbox");
  const divider = document.getElementById("AIdivider");

  if (!textBox || !aiBox || !divider) {
    console.warn("Split view requires #TextBox, #AIbox, and #AIdivider to exist.");
    return;
  }

  const parent = textBox.parentElement;

  // Clone AI Box (remove ID to avoid duplicates)
  const newAiBox = aiBox.cloneNode(true);
  newAiBox.id = "TextBox";
  newAiBox.style.width = "300px";
  newAiBox.style.flex = "0 0 auto";
  newAiBox.style.backgroundColor = "white";
  newAiBox.style.position = "relative"; // Ensure button positions relative to this box
  newAiBox.innerHTML = `
        <div class="text-block" contenteditable="true">Press [Return] twice and type a letter to create a drop zone. Right-click to add sections!</div>
    `;

  // Clone Divider
  const newDivider = divider.cloneNode(true);
  newDivider.removeAttribute("id");
  newDivider.classList.add("ai-divider");
  newDivider.style.cursor = "col-resize";

  // Insert before TextBox
  parent.insertBefore(newAiBox, textBox);
  parent.insertBefore(newDivider, textBox);

  // Attach resize logic to the new pair
  attachResizeLogic(newDivider, newAiBox);
  
  // Attach Editor Logic
  const newBlock = newAiBox.querySelector('.text-block');
  if (newBlock) attachListeners(newBlock);
  getWallObserver().observe(newAiBox);
}

function attachResizeLogic(divider, box) {
  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  divider.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startWidth = box.offsetWidth;
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    const newWidth = Math.max(150, Math.min(600, startWidth + delta));
    
    box.style.width = `${newWidth}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  });
}