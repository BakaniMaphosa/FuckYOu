/**
 * chooseContentType.js
 * Original logic to handle the choice menu and info page overlay
 */

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

    if (!contentList) return;

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

            // Fetch the detailed info page
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

        // --- SELECTION LOGIC ---
        // On the 25th, this just logged the selection to the console
        // because we hadn't built the injection bridge yet.
        console.log(`User selected: ${specificTitle}`);
        
        // This is where you likely had a placeholder for future logic
        // Example: handleSelection(specificTitle);
    });
}