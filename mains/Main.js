import { setupDivInsertion } from "/Components/textBoxDesign.js";

async function loadComponent(targetId, file) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const html = await res.text();
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = html;
        }
    } catch (err) {
        console.error(err);
    }
}

async function init() {
  // Load screenLogic.html's BODY content into ContentContainer
  await loadComponent("ContentContainer", "/currentDesign/screenLogic.html");
  
  // Wait for DOM to update
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // NOW the elements from screenLogic.html exist
  const editor = document.getElementById("TextBox"); // This is from screenLogic.html
  const contextMenu = document.getElementById("customContextMenu");
  
  console.log("Editor found:", editor);
  console.log("Context menu found:", contextMenu);
  
  if (editor && contextMenu) {
    // Load the textbox content FIRST
    editor.innerHTML = `
        <div class="text-block" contenteditable="true">Press [Return] twice and type a letter to create a drop zone. Right-click to add sections!</div>
    `;
    
    // Wait a tick
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // THEN setup the div insertion logic
    setupDivInsertion({ editor, contextMenu });
    
    // Setup the divider resize logic
    setupDividerResize();
  } else {
    console.error("❌ Could not find editor or context menu!");
  }
}

// Divider resize logic (moved from screenLogic.js)
function setupDividerResize() {
    const divider = document.getElementById("AIdivider");
    const aiBox = document.getElementById("AIbox");
    
    if (!divider || !aiBox) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    divider.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startWidth = aiBox.offsetWidth;
        e.preventDefault();
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const min = 150;
        const max = 600;
        const deltaX = e.clientX - startX;
        let newWidth = startWidth + deltaX;

        if (newWidth < min) newWidth = min;
        if (newWidth > max) newWidth = max;

        aiBox.style.flex = "0 0 auto";
        aiBox.style.width = `${newWidth}px`;
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
    });
}

init();