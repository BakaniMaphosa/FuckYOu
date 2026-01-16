export function createCodeSnippet(box) {
    const contentArea = box.querySelector('.content');
    if (!contentArea) return;

    contentArea.innerHTML = "";
    contentArea.style.padding = "0";

    // Ensure CSS is loaded
    if (!document.querySelector('link[href*="CodeSnippet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/Components/ContentTypes/CodeSnippet/CodeSnippet.css';
        document.head.appendChild(link);
    }

    // --- 1. Main Container ---
    const codeWindow = document.createElement('div');
    codeWindow.className = 'code-window';
    codeWindow.style.display = 'flex';
    codeWindow.style.flexDirection = 'column';
    codeWindow.style.height = '100%';
    codeWindow.style.width = '100%';
    codeWindow.style.background = '#1e1e1e';
    codeWindow.style.borderRadius = '0';
    codeWindow.style.overflow = 'hidden';

    // --- 2. Header ---
    const header = document.createElement('div');
    header.className = 'code-header';

    // 2a. Traffic Lights
    const trafficLights = document.createElement('div');
    trafficLights.className = 'traffic-lights';
    trafficLights.style.display = 'flex';
    trafficLights.style.gap = '6px';
    
    ['#ff5f56', '#ffbd2e', '#27c93f'].forEach(color => {
        const span = document.createElement('span');
        span.className = 'light';
        span.style.width = '12px';
        span.style.height = '12px';
        span.style.borderRadius = '50%';
        span.style.backgroundColor = color;
        trafficLights.appendChild(span);
    });

    // 2b. File Name
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.id = 'fileName';
    fileName.contentEditable = 'true';
    fileName.innerText = 'script.js';
    fileName.style.fontFamily = "'Source Code Pro', 'Fira Code', 'JetBrains Mono', 'Courier New', monospace";
    fileName.style.fontSize = '18px';
    fileName.style.outline = 'none';

    // 2c. Actions (Select + Copy)
    const actions = document.createElement('div');
    actions.className = 'header-actions';
    actions.style.display = 'flex';
    actions.style.gap = '10px';
    actions.style.alignItems = 'center';

    // Custom Select
    const selectContainer = document.createElement('div');
    selectContainer.className = 'custom-select';
    selectContainer.style.position = 'relative';
    selectContainer.style.fontFamily = 'sans-serif';
    
    const selectSelected = document.createElement('div');
    selectSelected.className = 'select-selected';
    selectSelected.innerText = 'JAVASCRIPT';
    selectSelected.style.color = '#fff';
    selectSelected.style.fontSize = '12px';
    selectSelected.style.cursor = 'pointer';
    selectSelected.style.padding = '4px 8px';
    selectSelected.style.background = '#444';
    selectSelected.style.borderRadius = '4px';

    const selectItems = document.createElement('div');
    selectItems.className = 'select-items';
    selectItems.style.position = 'absolute';
    selectItems.style.backgroundColor = '#333';
    selectItems.style.top = '100%';
    selectItems.style.left = '0';
    selectItems.style.right = '0';
    selectItems.style.zIndex = '99';
    selectItems.style.display = 'none';
    
    const languages = ['JAVASCRIPT', 'PYTHON', 'HTML', 'CSS', 'JAVA', 'C++', 'C#', 'GO', 'RUST'];
    const modeMap = {
        'JAVASCRIPT': 'javascript',
        'PYTHON': 'python',
        'HTML': 'html',
        'CSS': 'css',
        'JAVA': 'java',
        'C++': 'c_cpp',
        'C#': 'csharp',
        'GO': 'golang',
        'RUST': 'rust'
    };

    languages.forEach(lang => {
        const item = document.createElement('div');
        item.innerText = lang;
        item.style.color = '#fff';
        item.style.padding = '8px 16px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
        item.style.fontSize = '12px';
        
        item.addEventListener('mouseenter', () => item.style.backgroundColor = 'rgba(0,0,0,0.1)');
        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
        
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectSelected.innerText = lang;
            selectItems.style.display = 'none';
            
            // Update Ace Mode
            if (box.aceEditor) {
                const mode = modeMap[lang] || 'text';
                box.aceEditor.session.setMode(`ace/mode/${mode}`);
            }
        });
        selectItems.appendChild(item);
    });

    selectSelected.addEventListener('click', (e) => {
        e.stopPropagation();
        selectItems.style.display = selectItems.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => selectItems.style.display = 'none');

    selectContainer.appendChild(selectSelected);
    selectContainer.appendChild(selectItems);

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
    copyBtn.style.background = 'transparent';
    copyBtn.style.border = '1px solid #555';
    copyBtn.style.color = '#ccc';
    copyBtn.style.borderRadius = '4px';
    copyBtn.style.padding = '4px 8px';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.fontSize = '12px';

    actions.appendChild(selectContainer);
    actions.appendChild(copyBtn);

    header.appendChild(trafficLights);
    header.appendChild(fileName);
    header.appendChild(actions);

    // --- 3. Editor Area & Overlay ---
    const editorWrapper = document.createElement('div');
    editorWrapper.style.position = 'relative';
    editorWrapper.style.flex = '1';
    editorWrapper.style.display = 'flex';
    editorWrapper.style.flexDirection = 'column';

    const editor = document.createElement('div');
    editor.id = 'editor';
    editor.style.flex = '1';
    editor.style.fontSize = '18px';

    // Overlay to capture clicks for dragging (View Mode)
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '10';
    overlay.style.cursor = 'text'; // Hint that it's editable

    editorWrapper.appendChild(editor);
    editorWrapper.appendChild(overlay);

    // Assemble
    codeWindow.appendChild(header);
    codeWindow.appendChild(editorWrapper);
    contentArea.appendChild(codeWindow);

    // --- 4. Initialize Ace Editor ---
    if (window.ace) {
        const aceEditor = ace.edit(editor);
        aceEditor.setTheme("ace/theme/monokai"); // Dark theme matches your UI
        aceEditor.session.setMode("ace/mode/javascript");
        aceEditor.setShowPrintMargin(false);
        aceEditor.setOptions({ "useSoftTabs": true, "tabSize": 2 });

        aceEditor.session.setUseWrapMode(true); // Enable text wrapping for responsiveness
        aceEditor.setOption("fontFamily", "'Source Code Pro', 'Fira Code', 'JetBrains Mono', 'Courier New', monospace");
        
        // Set initial content
        aceEditor.setValue(`function hello() {
  console.log("test");
  const x = 42;
  return x * 2;
}`); // -1 moves cursor to start

        // Store instance on the box for later access (resizing, etc.)
        box.aceEditor = aceEditor;

        // Copy Logic (Using Ace API)
        copyBtn.addEventListener('click', () => {
            const code = aceEditor.getValue();
            navigator.clipboard.writeText(code).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                copyBtn.style.color = '#27c93f';
                copyBtn.style.borderColor = '#27c93f';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.color = '#ccc';
                    copyBtn.style.borderColor = '#555';
                }, 2000);
            });
        });

        // Ensure editor resizes with the box
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                const newFontSize = Math.max(18, Math.min(42, width / 20));
                aceEditor.setFontSize(newFontSize);
            }
            aceEditor.resize();
        });
        resizeObserver.observe(codeWindow);

        // --- Double-Click to Edit Logic ---
        overlay.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            overlay.style.display = 'none';
            aceEditor.focus();
        });

        // Restore overlay when focus is lost
        aceEditor.on('blur', () => {
            overlay.style.display = 'block';
        });
    } else {
        editor.innerText = "Error: Ace Editor library not loaded.";
        editor.style.padding = "20px";
        editor.style.color = "red";
    }
}