import { setupDivInsertion, setupEditorContextMenu } from "/Components/textBoxDesign.js";

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

// ... existing loadComponent code ...

async function init() {
  await loadComponent("TextBox", "/Components/textBoxDesign.html");

  const editor = document.getElementById("ContentArea");
  const contextMenu = document.getElementById("customContextMenu");

  if (!editor || !contextMenu) return;

  // Track the last right-click position
  let lastClickPos = { x: 0, y: 0 };

  window.addEventListener("contextmenu", (e) => {
    if (editor.contains(e.target) || e.target.closest('.resizable-node')) {
      // Capture coordinates relative to the document
      lastClickPos.x = e.pageX - 40;
      lastClickPos.y = e.pageY - 40;
    }
  }, true);

  setupDivInsertion({
    editor,
    contextMenu,
    content: "Editable Box Content",
    getClickPos: () => lastClickPos // Pass a function to retrieve the coordinates
  });

  setupEditorContextMenu(editor, contextMenu);

  if (editor.firstChild) {
    editor.innerHTML = editor.innerHTML.trim();
  }
}

init();