export function initializeToolbarFunctionality() {
    const textBox = document.getElementById('TextBox');
    if (!textBox) {
        console.error("TextBox not found!");
        return;
    }

    // Make sure contentEditable elements can receive formatting
    textBox.addEventListener('focus', (e) => {
        if (e.target.classList.contains('text-block') || e.target.isContentEditable) {
            console.log("✅ Editable element focused");
        }
    }, true);

    // ============================================
    // FORMATTING FUNCTIONS
    // ============================================
    
    function applyFormat(command, value = null) {
        document.execCommand(command, false, value);
        updateToolStates();
    }

    function applyInlineStyle(property, value) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style[property] = value;

        try {
            range.surroundContents(span);
        } catch (e) {
            // If surroundContents fails (complex selection), wrap each text node
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
        }
        
        // Restore selection
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        
        updateToolStates();
    }

    // ============================================
    // TOOL CLICK HANDLERS
    // ============================================

    // Bold
    const boldTool = document.querySelector('.tool .fa-bold')?.closest('.tool');
    if (boldTool) {
        boldTool.addEventListener('click', () => applyFormat('bold'));
    }

    // Italic
    const italicTool = document.querySelector('.tool .fa-italic')?.closest('.tool');
    if (italicTool) {
        italicTool.addEventListener('click', () => applyFormat('italic'));
    }

    // Underline
    const underlineTool = document.querySelector('.tool .fa-underline')?.closest('.tool');
    if (underlineTool) {
        underlineTool.addEventListener('click', () => applyFormat('underline'));
    }

    // Highlight (background color)
    const highlightInput = document.querySelector('.fa-highlighter')?.closest('.tool')?.querySelector('input[type="color"]');
    if (highlightInput) {
        highlightInput.addEventListener('change', (e) => {
            applyFormat('hiliteColor', e.target.value);
        });
    }

    // Font Size
    const fontSizeInput = document.querySelector('.fa-text-height')?.closest('.tool')?.querySelector('.num-input');
    const fontSizeBtns = document.querySelector('.fa-text-height')?.closest('.tool')?.querySelectorAll('.num-btn');
    
    if (fontSizeInput) {
        fontSizeInput.addEventListener('change', (e) => {
            applyInlineStyle('fontSize', e.target.value + 'px');
        });
        
        if (fontSizeBtns && fontSizeBtns.length >= 2) {
            const fontSizeDecrease = fontSizeBtns[0];
            const fontSizeIncrease = fontSizeBtns[1];
            
            fontSizeIncrease.addEventListener('click', () => {
                fontSizeInput.value = Math.min(parseInt(fontSizeInput.max), parseInt(fontSizeInput.value) + 1);
                applyInlineStyle('fontSize', fontSizeInput.value + 'px');
            });
            
            fontSizeDecrease.addEventListener('click', () => {
                fontSizeInput.value = Math.max(parseInt(fontSizeInput.min), parseInt(fontSizeInput.value) - 1);
                applyInlineStyle('fontSize', fontSizeInput.value + 'px');
            });
        }
    }

    // Foreground Color (text color)
    const foregroundInput = document.querySelector('.fa-palette')?.closest('.tool')?.querySelector('input[type="color"]');
    if (foregroundInput) {
        foregroundInput.addEventListener('change', (e) => {
            applyFormat('foreColor', e.target.value);
        });
    }

    // Text Alignment
    const alignTool = document.querySelector('.fa-align-left')?.closest('.tool');
    if (alignTool) {
        const alignButtons = alignTool.querySelectorAll('.align-btn');
        if (alignButtons.length >= 3) {
            alignButtons[0].addEventListener('click', () => applyFormat('justifyLeft'));
            alignButtons[1].addEventListener('click', () => applyFormat('justifyCenter'));
            alignButtons[2].addEventListener('click', () => applyFormat('justifyRight'));
        }
    }

    // Bullet List
    const bulletTool = document.querySelector('.fa-list-ul')?.closest('.tool');
    if (bulletTool) {
        bulletTool.addEventListener('click', () => applyFormat('insertUnorderedList'));
    }

    // Numbered List
    const numberedTool = document.querySelector('.fa-list-ol')?.closest('.tool');
    if (numberedTool) {
        numberedTool.addEventListener('click', () => applyFormat('insertOrderedList'));
    }

    // Horizontal Line
    const horizontalTool = document.querySelector('.fa-minus')?.closest('.tool');
    if (horizontalTool) {
        horizontalTool.addEventListener('click', () => applyFormat('insertHorizontalRule'));
    }

    // ============================================
    // UPDATE TOOL STATES (Show active formatting)
    // ============================================
    
    function updateToolStates() {
        // Update bold button
        if (boldTool) {
            const isBold = document.queryCommandState('bold');
            boldTool.style.backgroundColor = isBold ? '#F4F1EA' : '';
        }

        // Update italic button
        if (italicTool) {
            const isItalic = document.queryCommandState('italic');
            italicTool.style.backgroundColor = isItalic ? '#F4F1EA' : '';
        }

        // Update underline button
        if (underlineTool) {
            const isUnderline = document.queryCommandState('underline');
            underlineTool.style.backgroundColor = isUnderline ? '#F4F1EA' : '';
        }

        // Update font size input
        if (fontSizeInput) {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                const parent = range.commonAncestorContainer.parentElement;
                if (parent) {
                    const fontSize = window.getComputedStyle(parent).fontSize;
                    fontSizeInput.value = parseInt(fontSize);
                }
            }
        }
    }

    // Listen for selection changes to update tool states
    document.addEventListener('selectionchange', updateToolStates);
    
    // Also update on mouseup in textbox
    textBox.addEventListener('mouseup', updateToolStates);
    textBox.addEventListener('keyup', updateToolStates);

    console.log("✅ Toolbar functionality initialized!");
}