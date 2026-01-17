export function createTextContent(box, type = 'body') {
    const contentArea = box.querySelector('.content');
    contentArea.innerHTML = ""; 
    contentArea.style.position = "relative";

    // 1. Create the Text Element
    const textElement = document.createElement('div');
    textElement.contentEditable = "false"; 
    textElement.className = `content-text ${type}-style`;
    
    // Style logic (keeping your exact styles)
    if(type === 'header'){
        textElement.innerText = 'New Header';
        Object.assign(textElement.style, {
            fontSize: "22px", fontWeight: "800", color: "#1a1a1a",
            lineHeight: "1.2", letterSpacing: "-0.5px",
            borderBottom: "2px solid #ff007a", paddingBottom: "4px", marginBottom: "10px",
            outline: "none"
        });
    } else {
        textElement.innerText = 'Ready when you are... ';
        Object.assign(textElement.style, {
            flex: "1", height: "100%", fontFamily: '"IBM Plex Serif", serif',
            fontWeight: "300", fontSize: "22px", lineHeight: "1.45",
            letterSpacing: "-0.005em", overflowY: "auto" 
        });
    }

    // 2. Create the Shield
    // 2. Create the Shield (Inset to allow handle access)
    const shield = document.createElement('div');
    shield.className = "drag-shield";
    Object.assign(shield.style, {
        position: 'absolute', 
        top: '2%', 
        left: '2%', 
        width: '96%', 
        height: '96%',
        zIndex: '1', // Lower than handles, but higher than text
        pointerEvents: 'auto'
    });

    // 3. Double Click Logic (The Switch)
    shield.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        console.log("Entering Edit Mode");
        
        shield.remove(); // Get the blue div out of the way
        textElement.contentEditable = "true";
        textElement.focus();
        
        // Move caret to the end of text
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(textElement);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    });

    // 4. Blur Logic (The Lock)
    textElement.addEventListener('blur', () => {
        console.log("Exiting Edit Mode");
        textElement.contentEditable = "false";
        contentArea.appendChild(shield); // Put the blue div back on top
    });

    // 5. Final Assembly
    contentArea.appendChild(textElement);
    contentArea.appendChild(shield);
}