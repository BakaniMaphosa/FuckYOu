/**
 * Logic to insert and manage resizable nodes within a contentEditable editor
 */
import { getContentInfo } from "/Components/chooseContentType.js";
import { createGraph } from "/Components/Graphs/graphs.js";


// Updated to accept the actual element OR an ID
async function loadComponent(target, file) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const html = await res.text();
        
        // If 'target' is a string, find by ID. If it's an element, use it directly.
        const targetElement = (typeof target === 'string') ? document.getElementById(target) : target;
        
        if (targetElement) {
            targetElement.innerHTML = html;
        }
    } catch (err) {
        console.error(err);
    }
}

// Global tracking for the selected node to enable deletion
let selectedNode = null;

// This is the bridge you need for your other files to talk to this one
export function getSelectedNode() {
  return selectedNode;
}

export function setupDivInsertion({
  editor,
  contextMenu,
  content = "New Box",
  getClickPos 
}) {
  let savedRange = null;

  if (editor) {
    editor.innerHTML = editor.innerHTML.trim();
  }

  // --- DELETE LOGIC ---
  window.addEventListener("keydown", (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
      }
      selectedNode.remove();
      selectedNode = null;
    }
  });

  // Deselect when clicking the editor background
  editor.addEventListener("mousedown", (e) => {
    if (e.target === editor) {
      deselectAll();
    }
  });

  function deselectAll() {
    if (selectedNode) {
      selectedNode.style.outline = "none";
      selectedNode = null;
    }
  }

  // --- CENTERED DRAGGABLE MENU LOADER ---
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
        margin: '0',
        zIndex: '10000',
        cursor: 'grab' 
      });
      
      document.body.appendChild(menuContainer);

      const res = await fetch("/Components/chooseContentType.html");
      const html = await res.text();
      menuContainer.innerHTML = html;

      // Initialize chooseContentType.js logic
      getContentInfo();

      // --- DRAGGING LOGIC FOR MENU ---
      let isDragging = false;
      let startX, startY, initialMouseX, initialMouseY;

      menuContainer.addEventListener("mousedown", (e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.id === "ReturnButton") return;
        
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

      const closeMenu = () => menuContainer.remove();
      const backBtn = menuContainer.querySelector("#ReturnButton");
      if (backBtn) backBtn.onclick = closeMenu;

    } catch (err) {
      console.error("Load Error:", err);
    }
  }

  // Handle Context Menu
  contextMenu.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.getAttribute("data-action");
    
    if (action === "insert-Image" || action === "Make-Section") {
      e.preventDefault();
      const pos = getClickPos ? getClickPos() : { x: 100, y: 100 };
      insertDiv(action === "Make-Section" ? "New Section" : content, pos);
      contextMenu.style.display = "none";
    }
  });

  // --- INSERT BOX LOGIC ---
  function insertDiv(boxText, pos) {
    const wrapper = document.createElement("div");
    wrapper.className = "resizable-node";
    wrapper.contentEditable = "false";
    wrapper.tabIndex = 0; 
    
    const editorRect = editor.getBoundingClientRect();
    Object.assign(wrapper.style, {
        position: 'absolute',
        left: `${pos.x - editorRect.left}px`,
        top: `${pos.y - editorRect.top}px`,
        zIndex: "2"
    });

  wrapper.addEventListener("mousedown", (e) => {
      e.stopPropagation(); 
      deselectAll();
      selectedNode = wrapper;
      wrapper.style.outline = "2px solid #ff007a"; 

    });

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";
    contentDiv.textContent = boxText;

    const sectionTools = document.createElement("div");
    sectionTools.className = "SectionTools";

    sectionTools.innerHTML = `
      <div class="SectionLayout"><img src="/Components/imgs/svgs/paintbrush-INACTIVE.svg" class="CustimiseLayout"></div>
      <div class="ContentType"><img src="/Components/imgs/svgs/AddContentType.svg" class="ChooseSectionType"></div>
    `;

    sectionTools.querySelector('.ContentType').onclick = (e) => {
      e.stopPropagation();
      selectedNode = wrapper; // Ensure this box is selected when opening menu
      loadChooseMenu();
    };

    const right = createHandle("right", "e-resize", "top:0; right:0; width:8px; height:100%;");
    const bottom = createHandle("bottom", "s-resize", "bottom:0; left:0; width:100%; height:8px;");
    const corner = createHandle("corner", "se-resize", "bottom:0; right:0; width:15px; height:15px; z-index:3;");

    wrapper.append(contentDiv, sectionTools, right, bottom, corner);
    editor.appendChild(wrapper);

    applyInteractivity(wrapper, right, bottom, corner);
  }

  function createHandle(name, cursor, extraStyle) {
    const h = document.createElement("span");
    h.className = `handle ${name}`;
    h.style.cssText = `position:absolute; cursor:${cursor}; ${extraStyle}`;
    return h;
  }

  function applyInteractivity(node, right, bottom, corner) {
    let startX, startY, startW, startH, offsetX, offsetY;
    let activeHandle = null;

    const handleMove = (e) => {
      if (activeHandle) {
        if (activeHandle === right || activeHandle === corner) {
          node.style.width = Math.max(100, startW + (e.clientX - startX)) + "px";
        }
        if (activeHandle === bottom || activeHandle === corner) {
          node.style.height = Math.max(80, startH + (e.clientY - startY)) + "px";
        }
      } else {
        const editorRect = editor.getBoundingClientRect();
        node.style.left = `${e.clientX - editorRect.left - offsetX}px`;
        node.style.top = `${e.clientY - editorRect.top - offsetY}px`;
      }
    };

    const stopInteraction = () => {
      activeHandle = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopInteraction);
    };

    const startResize = (e, handle) => {
      e.preventDefault(); e.stopPropagation();
      activeHandle = handle;
      startX = e.clientX; startY = e.clientY;
      startW = node.offsetWidth; startH = node.offsetHeight;
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", stopInteraction);
    };

    node.addEventListener("pointerdown", (e) => {
      if (e.target.classList.contains('handle') || e.target.closest('.SectionTools')) return;
      const rect = node.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", stopInteraction);
    });

    right.addEventListener("pointerdown", e => startResize(e, right));
    bottom.addEventListener("pointerdown", e => startResize(e, bottom));
    corner.addEventListener("pointerdown", e => startResize(e, corner));
  }
}

export function setupEditorContextMenu(editor, contextMenu) {
  if (contextMenu) contextMenu.style.display = "none";

  window.addEventListener("contextmenu", (e) => {
    if (editor.contains(e.target) || e.target.closest('.resizable-node')) {
      e.preventDefault();
      contextMenu.style.display = "block"; 
      contextMenu.style.left = e.clientX + "px";
      contextMenu.style.top = e.clientY + "px";
    }
  }, true);
  document.addEventListener("mousedown", (e) => {
    if (!contextMenu.contains(e.target)) contextMenu.style.display = "none";
  });
}

