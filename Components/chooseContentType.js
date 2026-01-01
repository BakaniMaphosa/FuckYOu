/**
 * chooseContentType.js
 * Logic to handle the choice menu, info page overlay, and auto-close
 */

import { getSelectedNode } from "/Components/textBoxDesign.js";
import { createGraph } from "/Components/Graphs/graphs.js";
import { createImageContent } from "/Components/ImagesLogic/images.js";
import { createTextContent } from "/Components/TextContent/TextContents.js";

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
    const searchInput = document.getElementById('SearchInput');

    if (!contentList || !contentBox) return;

    // --- 1. SEARCH & FILTER LOGIC ---
    // This is now outside the click listener so it works immediately
    if (searchInput) {
        // Auto-focus the search bar for better UX
        searchInput.focus();

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log("Input detected:", searchTerm);

            const items = contentList.querySelectorAll('.ContentType');
            
            items.forEach(item => {
                const span = item.querySelector('span');
                if (span) {
                    const text = span.innerText.toLowerCase();
                    // Show item if it matches search, otherwise hide
                    if (text.includes(searchTerm)) {
                        item.style.display = "flex"; 
                    } else {
                        item.style.display = "none";
                    }
                }
            });
        });
    }

    // --- 2. MENU REMOVAL LOGIC ---
    function removeChooseContentBox() {
        if (contentBox) {
            contentBox.remove();
            document.removeEventListener('mousedown', closeMenu);
        }
    }

    const closeMenu = (e) => {
        // If the click is NOT inside the contentBox, remove the menu
        if (contentBox && !contentBox.contains(e.target)) {
            removeChooseContentBox();
        }
    };

    // Delay listener slightly so the click that opens the menu doesn't close it
    setTimeout(() => {
        document.addEventListener('mousedown', closeMenu);
    }, 10);

    // --- 3. TOOL SELECTION LISTENER ---
    contentList.addEventListener('click', async (event) => {
        const listItem = event.target.closest('.ContentType');
        if (!listItem) return;

        const specificTitle = listItem.querySelector('span').innerText;
        const addButton = event.target.closest('.AddType');

        // --- INFO PAGE OVERLAY LOGIC ---
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

        // --- CONTENT CREATION LOGIC ---
        console.log(`User selected: ${specificTitle}`);
        let selectedNode = getSelectedNode();

        switch (specificTitle) {
            case "Title Header":
                createTextContent(selectedNode, 'header');
                removeChooseContentBox();
                break;

            case "Text Box":
                createTextContent(selectedNode);
                removeChooseContentBox();
                break;

            case "Graph":
                createGraph(selectedNode, 'line');
                removeChooseContentBox();
                break;

            case 'Image':
                createImageContent(selectedNode, '/Components/imgs/OIP.jpeg');
                removeChooseContentBox();
                break;
        }
    });
}