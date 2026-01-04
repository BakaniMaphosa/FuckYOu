import { setupDivInsertion } from "/Components/textBoxDesign.js";

// ============================================
// DIVIDER RESIZE LOGIC
// ============================================
const divider = document.getElementById("AIdivider");
const aiBox = document.getElementById("AIbox");

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

// ============================================
// LOAD TEXTBOX CONTENT
// ============================================
async function loadTextBox() {
    const textBox = document.getElementById("TextBox");
    
    // Load the textbox HTML content
    textBox.innerHTML = `
        <div class="text-block" contenteditable="true">Press [Return] twice and type a letter to create a drop zone. Right-click to add sections!</div>
       
    `;
    
    // Wait for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get elements
    const editor = document.getElementById("TextBox");
    const contextMenu = document.getElementById("customContextMenu");
    
    console.log("Editor found:", editor);
    console.log("Context menu found:", contextMenu);
    
    if (editor && contextMenu) {
        setupDivInsertion({ editor, contextMenu });
    } else {
        console.error("❌ Could not find editor or context menu!");
    }
}

// Initialize
loadTextBox();