export function createTextContent(box, type = 'body') {
    // 1. Find the actual content area inside the box
    const contentArea = box.querySelector('.content');
    
    // 2. Clear ONLY the content area (not the whole box!)
    contentArea.innerHTML = ""; 

    // 3. Create the text element
    const textElement = document.createElement('div');
    textElement.contentEditable = "true";
    textElement.className = `content-text ${type}-style`;
    
    // 4. Set the text
   
    if(type==='header'){
        textElement.innerText = 'New Header';

        textElement.style.fontSize = "22px";
        textElement.style.fontWeight = "800";       // Extra bold
        textElement.style.color = "#1a1a1a";        // Near black for contrast
        textElement.style.lineHeight = "1.2";
        textElement.style.letterSpacing = "-0.5px"; // Tighter letters look modern
        textElement.style.borderBottom = "2px solid #ff007a"; // Your pink theme
        textElement.style.paddingBottom = "4px";
        textElement.style.marginBottom = "10px";
           //header style goes here
    }else{
            textElement.innerText = 'Ready when you are... ';
            //simple text style goes here

        textElement.style.flex = "1";
        textElement.style.height = "100%";
        // textElement.style.border = "4px solid black";
        textElement.style.fontFamily = '"IBM Plex Serif", serif';
        textElement.style.fontWeight = "300";
        textElement.style.fontSize = "22px";
        textElement.style.lineHeight = "1.45";
        textElement.style.letterSpacing = "-0.005em";
        textElement.style.overflowY = "auto";
    }

    
    // 5. Put the text inside the content area
    contentArea.appendChild(textElement);

    textElement.focus();
    document.execCommand('selectAll', false, null);

}