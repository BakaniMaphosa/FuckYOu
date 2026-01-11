export function initializeToolbarFunctionality() {
    // Cleanup old menus to prevent duplicates/leaks when switching tabs
    document.querySelectorAll('.submenu-popup').forEach(el => el.remove());
    document.querySelectorAll('.ff-menu-container').forEach(el => el.remove());

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
    
    // Enable CSS mode for execCommand to generate spans instead of font tags
    document.execCommand('styleWithCSS', false, true);

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
        // Drill down to the deepest single element wrapper to ensure we select the content
        // This fixes the issue where wrapping an existing style (like font-size) causes
        // the toolbar to read the wrapper's default style instead of the inner element's style.
        let targetNode = span;
        while (targetNode.children.length === 1 && targetNode.textContent.trim() === targetNode.firstElementChild.textContent.trim()) {
            targetNode = targetNode.firstElementChild;
        }
        
        range.selectNodeContents(targetNode);
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

    // Strikethrough
    const strikeTool = document.querySelector('.tool .fa-strikethrough')?.closest('.tool');
    if (strikeTool) {
        strikeTool.addEventListener('click', () => applyFormat('strikethrough'));
    }

    // Subscript
    const subTool = document.querySelector('.tool .fa-subscript')?.closest('.tool');
    if (subTool) {
        subTool.addEventListener('click', () => applyFormat('subscript'));
    }

    // Superscript
    const supTool = document.querySelector('.tool .fa-superscript')?.closest('.tool');
    if (supTool) {
        supTool.addEventListener('click', () => applyFormat('superscript'));
    }

    // Highlight (Painter Mode)
    const highlightTool = document.querySelector('.fa-highlighter')?.closest('.tool');
    const highlightInput = highlightTool?.querySelector('input[type="color"]');
    
    let isHighlightMode = false;
    let currentHighlightColor = '#ffff00'; // Default yellow

    if (highlightTool && highlightInput) {
        // 1. Handle Color Change
        highlightInput.addEventListener('change', (e) => {
            currentHighlightColor = e.target.value;
            // Apply immediately if text is selected
            applyFormat('hiliteColor', currentHighlightColor);
        });

        // 2. Handle Toggle Click (Painter Mode)
        highlightTool.addEventListener('click', (e) => {
            // Ignore if clicking the color picker input directly
            if (e.target === highlightInput) return;

            isHighlightMode = !isHighlightMode;
            
            // Visual Feedback
            highlightTool.style.background = isHighlightMode ? 'var(--banana)' : '';
            highlightTool.style.borderColor = isHighlightMode ? 'var(--caviar)' : '';
            
            // Apply immediately if turning on with selection
            if (isHighlightMode) {
                applyFormat('hiliteColor', currentHighlightColor);
            }
        });
        
        // Initialize default color from input
        currentHighlightColor = highlightInput.value;
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

    // Foreground Color (Painter Mode)
    const foregroundTool = document.querySelector('.fa-palette')?.closest('.tool');
    const foregroundInput = foregroundTool?.querySelector('input[type="color"]');
    
    let isForegroundMode = false;
    let currentForegroundColor = '#000000'; // Default black

    if (foregroundTool && foregroundInput) {
        // 1. Handle Color Change
        foregroundInput.addEventListener('change', (e) => {
            currentForegroundColor = e.target.value;
            applyFormat('foreColor', currentForegroundColor);
        });

        // 2. Handle Toggle Click (Painter Mode)
        foregroundTool.addEventListener('click', (e) => {
            // Ignore if clicking the color picker input directly
            if (e.target === foregroundInput) return;

            isForegroundMode = !isForegroundMode;
            
            // Visual Feedback
            foregroundTool.style.background = isForegroundMode ? 'var(--banana)' : '';
            foregroundTool.style.borderColor = isForegroundMode ? 'var(--caviar)' : '';
            
            // Apply immediately if turning on with selection
            if (isForegroundMode) {
                applyFormat('foreColor', currentForegroundColor);
            }
        });
        
        // Initialize default color from input
        currentForegroundColor = foregroundInput.value;
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
        bulletTool.addEventListener('mousedown', (e) => e.preventDefault());
        bulletTool.addEventListener('click', () => applyFormat('insertUnorderedList'));
    }

    // Numbered List
    const numberedTool = document.querySelector('.fa-list-ol')?.closest('.tool');
    if (numberedTool) {
        numberedTool.addEventListener('mousedown', (e) => e.preventDefault());
        numberedTool.addEventListener('click', () => applyFormat('insertOrderedList'));
    }

    // Horizontal Line
    const horizontalTool = document.querySelector('.fa-minus')?.closest('.tool');
    if (horizontalTool) {
        horizontalTool.addEventListener('click', () => applyFormat('insertHorizontalRule'));
    }

    // Indent
    const indentTool = document.querySelector('.tool .fa-indent')?.closest('.tool');
    if (indentTool) {
        indentTool.addEventListener('click', () => applyFormat('indent'));
    }

    // Outdent
    const outdentTool = document.querySelector('.tool .fa-outdent')?.closest('.tool');
    if (outdentTool) {
        outdentTool.addEventListener('click', () => applyFormat('outdent'));
    }

    // Remove Format
    const removeFormatTool = document.querySelector('.tool .fa-eraser')?.closest('.tool') || 
                             document.querySelector('.tool .fa-remove-format')?.closest('.tool');
    if (removeFormatTool) {
        removeFormatTool.addEventListener('click', () => applyFormat('removeFormat'));
    }

    // Undo
    const undoTool = document.querySelector('.tool .fa-undo')?.closest('.tool') || 
                     document.querySelector('.tool .fa-rotate-left')?.closest('.tool');
    if (undoTool) {
        undoTool.addEventListener('click', () => applyFormat('undo'));
    }

    // Redo
    const redoTool = document.querySelector('.tool .fa-redo')?.closest('.tool') || 
                     document.querySelector('.tool .fa-rotate-right')?.closest('.tool');
    if (redoTool) {
        redoTool.addEventListener('click', () => applyFormat('redo'));
    }

    // ============================================
    // HOVER MENUS (Font Family & Line Settings)
    // ============================================
    
    function createHoverMenu(tool, contentFn, placement = 'bottom') {
        if (!tool) return;

        const menu = document.createElement('div');
        menu.className = 'submenu-popup';
        
        // Force styles for body-level positioning (escapes overflow clipping)
        Object.assign(menu.style, {
            position: 'fixed',
            zIndex: '10000',
            display: 'none',
            top: '0',
            left: '0'
        });
        
        contentFn(menu);
        document.body.appendChild(menu); // Append to body to avoid clipping

        let hideTimeout;

        function show() {
            clearTimeout(hideTimeout);
            
            // 1. Show briefly to calculate dimensions
            menu.style.display = 'flex';
            menu.style.visibility = 'hidden';
            
            // 2. Calculate position
            const rect = tool.getBoundingClientRect();
            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;
            
            let top, left;
            
            if (placement === 'right') {
                top = rect.top;
                left = rect.right + 10;
            } else if (placement === 'left') {
                top = rect.top;
                left = rect.left - menuWidth - (window.innerHeight * 0.01); // 1vh gap to the left
            } else if (placement === 'cover') {
                top = rect.top;
                left = rect.left - (window.innerHeight * 0.12);
            } else if (placement === 'cover-font') {
                top = rect.top;
                left = rect.left - (window.innerHeight * 0.02);
            } else {
                top = rect.bottom + (window.innerHeight * 0.02); // Position below tool + 2vh gap
                left = rect.left + (rect.width / 2) - (menuWidth / 2); // Center horizontally
            }
            
            // 3. Apply position and make visible
            menu.style.top = `${top}px`;
            menu.style.left = `${left}px`;
            menu.style.visibility = 'visible';
        }

        function hide() {
            hideTimeout = setTimeout(() => {
                menu.style.display = 'none';
            }, 200);
        }

        tool.addEventListener('mouseenter', show);
        tool.addEventListener('mouseleave', hide);
        
        menu.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
        menu.addEventListener('mouseleave', hide);
    }

    // 1. FONT FAMILY MENU (COMPLETELY ISOLATED REBUILD)
    const fontTool = document.querySelector('.fa-font')?.closest('.tool');
    if (fontTool) {
        const ffMenu = document.createElement('div');
        ffMenu.className = 'ff-menu-container';
        
        // Search
        const ffSearch = document.createElement('input');
        ffSearch.className = 'ff-search-input';
        ffSearch.placeholder = 'Search fonts...';
        ffSearch.addEventListener('click', e => e.stopPropagation());

        // List
        const ffList = document.createElement('div');
        ffList.className = 'ff-list-scroll';

        const fonts = [
            "Arial", "Helvetica", "Times New Roman", "Courier New", 
            "Georgia", "Verdana", "Trebuchet MS", "Impact", "Comic Sans MS",
            "Palatino", "Garamond", "Bookman", "Arial Black", "IBM Plex Serif"
        ];

        function renderUniqueFonts(filter = "") {
            ffList.innerHTML = "";
            fonts.forEach(font => {
                if (font.toLowerCase().includes(filter.toLowerCase())) {
                    const item = document.createElement('div');
                    item.className = 'ff-list-item';
                    item.innerText = font;
                    item.style.fontFamily = font;
                    
                    // Use mousedown to prevent focus loss issues
                    item.onmousedown = (e) => {
                        e.preventDefault(); 
                        e.stopPropagation();

                        // If a selection was saved when the menu opened, restore it.
                        // This ensures the command applies to the correct text even if focus was lost.
                        if (savedRange) {
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(savedRange);
                        }

                        applyFormat('fontName', font);

                        // Update active state immediately
                        Array.from(ffList.children).forEach(child => child.classList.remove('active-font'));
                        item.classList.add('active-font');
                    };
                    
                    ffList.appendChild(item);
                }
            });
        }

        ffSearch.addEventListener('input', (e) => renderUniqueFonts(e.target.value));
        renderUniqueFonts();

        ffMenu.appendChild(ffSearch);
        ffMenu.appendChild(ffList);
        document.body.appendChild(ffMenu);

        let savedRange = null; // To preserve text selection

        // Hover Logic
        let ffTimeout;
        
        function showFF() {
            clearTimeout(ffTimeout);
            ffMenu.classList.add('active');

            // Save the current text selection when the menu opens
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && selection.getRangeAt(0).toString().length > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            } else {
                savedRange = null;
            }
            
            // Positioning (cover-font logic)
            const rect = fontTool.getBoundingClientRect();
            const top = rect.top;
            const left = rect.left - (window.innerHeight * 0.02);
            
            ffMenu.style.top = `${top}px`;
            ffMenu.style.left = `${left}px`;

            // Highlight current font
            let currentFont = document.queryCommandValue('fontName');
            
            // Fallback: If queryCommandValue fails, check computed style of selection
            if (!currentFont && selection.rangeCount > 0) {
                const anchor = selection.anchorNode;
                const el = anchor.nodeType === 1 ? anchor : anchor.parentElement;
                if (el) {
                    currentFont = window.getComputedStyle(el).fontFamily;
                }
            }

            // Clean up: remove quotes, take first in stack
            currentFont = currentFont ? currentFont.replace(/['"]/g, '').split(',')[0].trim() : '';

            Array.from(ffList.children).forEach(item => {
                item.classList.remove('active-font');
                if (item.innerText.toLowerCase() === currentFont.toLowerCase()) {
                    item.classList.add('active-font');
                }
            });
        }

        function hideFF() {
            ffTimeout = setTimeout(() => {
                ffMenu.classList.remove('active');
                savedRange = null; // Clear selection when menu closes
            }, 200);
        }

        fontTool.addEventListener('mouseenter', showFF);
        fontTool.addEventListener('mouseleave', hideFF);
        ffMenu.addEventListener('mouseenter', () => clearTimeout(ffTimeout));
        ffMenu.addEventListener('mouseleave', hideFF);
    }

    // 2. LINE SETTINGS MENU (Line Height, Letter Spacing)
    // Targeting .fa-grip-lines (The "Line" tool)
    let lineTool = document.querySelector('.fa-grip-lines')?.closest('.tool');
    
    // Fallback: Find by text content "Line" if icon selector fails
    if (!lineTool) {
        const allTools = document.querySelectorAll('.tool');
        for (let t of allTools) {
            if (t.textContent.trim() === 'Line' || t.querySelector('.tool-name')?.textContent === 'Line') {
                lineTool = t;
                break;
            }
        }
    }
                     
    if (lineTool) {
        createHoverMenu(lineTool, (menu) => {
            menu.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <span class="submenu-label">Line Height</span>
                    <div class="num-control">
                        <button class="num-btn lh-dec">-</button>
                        <input type="text" class="num-input lh-val" value="1.5" style="width: 40px; text-align: center;" readonly>
                        <button class="num-btn lh-inc">+</button>
                    </div>
                </div>
                <div>
                    <span class="submenu-label">Letter Gap</span>
                    <div class="num-control">
                        <button class="num-btn ls-dec">-</button>
                        <input type="text" class="num-input ls-val" value="0" style="width: 40px; text-align: center;" readonly>
                        <button class="num-btn ls-inc">+</button>
                    </div>
                </div>
            `;
            
            const lhInput = menu.querySelector('.lh-val');
            const lsInput = menu.querySelector('.ls-val');
            
            // Line Height Logic
            menu.querySelector('.lh-dec').addEventListener('click', (e) => {
                e.stopPropagation();
                let val = parseFloat(lhInput.value) || 1.5;
                val = Math.max(0.5, val - 0.1);
                lhInput.value = val.toFixed(1);
                applyInlineStyle('lineHeight', val);
            });
            
            menu.querySelector('.lh-inc').addEventListener('click', (e) => {
                e.stopPropagation();
                let val = parseFloat(lhInput.value) || 1.5;
                val = val + 0.1;
                lhInput.value = val.toFixed(1);
                applyInlineStyle('lineHeight', val);
            });

            // Letter Spacing Logic
            menu.querySelector('.ls-dec').addEventListener('click', (e) => {
                e.stopPropagation();
                let val = parseFloat(lsInput.value) || 0;
                val = val - 0.5;
                lsInput.value = val;
                applyInlineStyle('letterSpacing', val + 'px');
            });
            
            menu.querySelector('.ls-inc').addEventListener('click', (e) => {
                e.stopPropagation();
                let val = parseFloat(lsInput.value) || 0;
                val = val + 0.5;
                lsInput.value = val;
                applyInlineStyle('letterSpacing', val + 'px');
            });
        }, 'cover');
    }

    // ============================================
    // UPDATE TOOL STATES (Show active formatting)
    // ============================================
    
    function updateToolStates() {
        // Update bold button
        if (boldTool) boldTool.classList.toggle('active', document.queryCommandState('bold'));

        // Update italic button
        if (italicTool) italicTool.classList.toggle('active', document.queryCommandState('italic'));

        // Update underline button
        if (underlineTool) underlineTool.classList.toggle('active', document.queryCommandState('underline'));

        // Update strikethrough button
        if (strikeTool) strikeTool.classList.toggle('active', document.queryCommandState('strikethrough'));

        // Update subscript button
        if (subTool) subTool.classList.toggle('active', document.queryCommandState('subscript'));

        // Update superscript button
        if (supTool) supTool.classList.toggle('active', document.queryCommandState('superscript'));

        // Update list buttons
        if (bulletTool) bulletTool.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
        if (numberedTool) numberedTool.classList.toggle('active', document.queryCommandState('insertOrderedList'));

        // Update alignment buttons
        if (alignTool) {
            const alignButtons = alignTool.querySelectorAll('.align-btn');
            if (alignButtons.length >= 3) {
                alignButtons[0].classList.remove('active'); // Left align always default
                alignButtons[1].classList.toggle('active', document.queryCommandState('justifyCenter'));
                alignButtons[2].classList.toggle('active', document.queryCommandState('justifyRight'));
            }
        }

        // Update font size input
        if (fontSizeInput) {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                const parent = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
                if (parent) {
                    const fontSize = window.getComputedStyle(parent).fontSize;
                    const sizeVal = parseInt(fontSize);
                    fontSizeInput.value = sizeVal;

                    if (sizeVal !== 18) {
                        fontSizeInput.style.backgroundColor = 'var(--banana)';
                    } else {
                        fontSizeInput.style.backgroundColor = '';
                    }
                }
            }
        }
    }

    // Listen for selection changes to update tool states
    document.addEventListener('selectionchange', updateToolStates);
    
    // Also update on mouseup in textbox
    textBox.addEventListener('mouseup', updateToolStates);
    textBox.addEventListener('keyup', updateToolStates);

    // ============================================
    // PAINTER MODE LISTENER (Global)
    // ============================================
    document.addEventListener('mouseup', () => {
        if (isHighlightMode || isForegroundMode) {
            const selection = window.getSelection();
            // Only apply if there is a selection and it's inside an editable area
            if (selection.toString().length > 0 && 
                selection.anchorNode?.parentElement?.closest('[contenteditable="true"]')) {
                
                if (isHighlightMode) {
                    applyFormat('hiliteColor', currentHighlightColor);
                }
                if (isForegroundMode) {
                    applyFormat('foreColor', currentForegroundColor);
                }
            }
        }
    });

    console.log("✅ Toolbar functionality initialized!");
}