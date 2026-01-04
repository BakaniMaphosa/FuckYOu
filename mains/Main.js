// Main.js - FIXED VERSION
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
  // Load the HTML first
  await loadComponent("TextBox", "/Components/textBoxDesign.html");
  
  // CRITICAL: Wait for the next frame so the browser finishes parsing the HTML
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // NOW get the elements (they exist now)
  const editor = document.getElementById("ContentArea");
  const contextMenu = document.getElementById("customContextMenu");
  
  console.log("Editor found:", editor);
  console.log("Context menu found:", contextMenu);
  
  if (editor && contextMenu) {
    setupDivInsertion({ editor, contextMenu });
  } else {
    console.error("❌ Could not find editor or context menu after loading!");
  }
}

init();