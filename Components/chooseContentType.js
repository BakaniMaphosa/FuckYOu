/**
 * chooseContentType.js
 * Logic to handle the choice menu, info page overlay, and auto-close
 */

import { getSelectedNode } from "/Components/textBoxDesign.js";
import { createGraph } from "/Components/Graphs/graphs.js";


async function loadComponent(targetElement, file) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const html = await res.text();
        targetElement.innerHTML = html;
        return true; 
    } catch (err) {
        console.error("Fetch Error:", err);
        return false;
    }
}

export function getContentInfo() {
    const contentList = document.getElementById('ContentType-List');
    const contentBox = document.getElementById('ContentBox');

    if (!contentList || !contentBox) return;

    // --- NEW: CLOSE ON CLICK OUTSIDE ---
    const closeMenu = (e) => {
        // If the click is NOT inside the contentBox, remove the menu
        if (!contentBox.contains(e.target)) {
            contentBox.remove();
            // Remove this listener so it doesn't keep running in the background
            document.removeEventListener('mousedown', closeMenu);
        }
    };

    // Use a small timeout so the click that OPENS the menu doesn't immediately CLOSE it
    setTimeout(() => {
        document.addEventListener('mousedown', closeMenu);
    }, 10);

    // --- EXISTING LISTENER ---
    contentList.addEventListener('click', async (event) => {
        const listItem = event.target.closest('.ContentType');
        if (!listItem) return;

        const specificTitle = listItem.querySelector('span').innerText;
        const addButton = event.target.closest('.AddType');

        // --- THE INFO PAGE OVERLAY LOGIC ---
        if (addButton) {
            event.stopPropagation(); 
            
            console.log(`Opening Info Page for: ${specificTitle}`);

            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            contentBox.appendChild(overlay);

            const floatingDiv = document.createElement('div');
            floatingDiv.className = 'floating-node';
            contentBox.appendChild(floatingDiv);

            const loaded = await loadComponent(floatingDiv, "/Components/contentType.html");

            if (loaded) {
                const nameHeader = floatingDiv.querySelector('#contentName');
                if (nameHeader) nameHeader.innerText = specificTitle;

                const backButton = floatingDiv.querySelector('#ReturnButton');
                const closeAll = () => {
                    overlay.remove();
                    floatingDiv.remove();
                };

                overlay.addEventListener('click', closeAll);
                if (backButton) backButton.addEventListener('click', closeAll);
            }
            return; 
        }

        console.log(`User selected: ${specificTitle}`);

        switch(specificTitle){
            case "Graph":
                let selectedNode = getSelectedNode();
                createGraph(selectedNode,'bar')
        }

    });
}