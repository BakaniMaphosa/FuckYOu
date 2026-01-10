import { setupDivInsertion } from "/Components/textBoxDesign.js";
import { toolBarLogic } from "/Navbar/studynotes/script.js";
import { addNoteLogic } from "/Navbar/CreateNote/addNote.js";


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

async function loadComponentByClass(targetClass, file) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        
        const html = await res.text();
        
        // Select all elements with the specific class
        const targets = document.querySelectorAll(`.${targetClass}`);
        
        if (targets.length > 0) {
            targets.forEach(target => {
                target.innerHTML = html;
            });
        } else {
            console.warn(`No elements found with class: ${targetClass}`);
        }
    } catch (err) {
        console.error(err);
    }
}

async function init() {
  // Load navbar and content
  await loadComponent("navBarContainer", "/Navbar/studynotes/index2.html");
  await loadComponent("ContentContainer", "/currentDesign/screenLogic.html");
  await loadComponentByClass("biz-card","/Navbar/NoteCards/NoteCard/NoteCard.html")
  
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // Initialize navbar
  await initializeNavbar();
  
  // ✅ WATCH FOR NAVBAR VISIBILITY AND TAB CHANGES
  const nav = document.getElementById('mainNav');
  const textBox = document.getElementById("ContentContainer");

  const CreateNote = document.querySelector(".action-btn.primary")
  

  CreateNote.addEventListener("click", async () => {
  console.log("✅ CreateNote clicked");
  


  let overlay = document.getElementById("WindowLevel");
  if (overlay) overlay.remove(); // for testing: reset each click

  overlay = document.createElement("div");
  overlay.id = "WindowLevel";

  // FORCE overlay behaviour
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "999999";
  overlay.style.background = "rgba(77, 77, 77, 0.35)"; // visible
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";


  document.body.appendChild(overlay);

  console.log("✅ Overlay appended:", overlay);

  await loadComponent("WindowLevel", "/Navbar/CreateNote/addNote.html");
  addNoteLogic()
});

  
  // Function to check and update margin
  function updateMargin() {
      if (!textBox || !nav) return;
      

      const isVisible = nav.classList.contains('visible');
      const isToolsTab = document.querySelector('.slider-btn[data-tab="tools"]')?.classList.contains('active');
      
      console.log("Navbar visible:", isVisible, "Tools active:", isToolsTab);
      
      // Only move down if BOTH navbar is visible AND tools tab is active
      if (isVisible && isToolsTab) {
          textBox.style.marginTop = "23vh";
          console.log("✅ Moved down");
      } else {
          textBox.style.marginTop = "0vh";
          console.log("✅ Moved up");
      }
  }
  
  // Watch navbar visibility changes
  const navObserver = new MutationObserver(updateMargin);
  navObserver.observe(nav, { attributes: true, attributeFilter: ['class'] });
  
  // Watch tab changes (watch the entire tabContent area)
  const tabContent = document.getElementById('tabContent');
  if (tabContent) {
      const tabObserver = new MutationObserver(updateMargin);
      tabObserver.observe(tabContent, { childList: true, subtree: true });
  }
  
  // Also watch for clicks on slider buttons
  document.addEventListener('click', (e) => {
      if (e.target.closest('.slider-btn')) {
          setTimeout(updateMargin, 100); // Small delay to let the active class update
      }
  });
  
  // Setup editor
  const editor = document.getElementById("TextBox");
  const contextMenu = document.getElementById("customContextMenu");
  
  if (editor && contextMenu) {
    editor.innerHTML = `
        <div class="text-block" contenteditable="true">Press [Return] twice and type a letter to create a drop zone. Right-click to add sections!</div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setupDivInsertion({ editor, contextMenu });
    setupDividerResize();
  } else {
    console.error("❌ Could not find editor or context menu!");
  }
}

async function initializeNavbar() {
    await new Promise(resolve => setTimeout(resolve, 100));
    toolBarLogic();
    console.log("✅ Navbar initialized!");
}

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