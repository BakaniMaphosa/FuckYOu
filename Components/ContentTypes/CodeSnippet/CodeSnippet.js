const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.setOptions({
    fontSize: "16px",  // ← Increased from 14px
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",  // ← Monaco-style font
    showPrintMargin: false,
    highlightActiveLine: true,
    showGutter: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: false
});

const langSelector = document.getElementById('langSelector');
const fileName = document.getElementById('fileName');
const copyBtn = document.getElementById('copyBtn');


// Language change
// Custom select functionality
const customSelect = document.getElementById('customSelect');
const selectSelected = customSelect.querySelector('.select-selected');
const selectItems = customSelect.querySelector('.select-items');
const options = selectItems.querySelectorAll('div');

let currentLang = 'javascript';

selectSelected.addEventListener('click', () => {
    selectItems.classList.toggle('select-hide');
    selectSelected.classList.toggle('select-arrow-active');
});

options.forEach(option => {
    option.addEventListener('click', () => {
        currentLang = option.getAttribute('data-value');
        selectSelected.textContent = option.textContent;
        selectItems.classList.add('select-hide');
        selectSelected.classList.remove('select-arrow-active');
        
        // Update editor language
        const extensions = {
            'javascript': 'js',
            'python': 'py',
            'html': 'html',
            'css': 'css',
            'java': 'java',
            'c_cpp': 'cpp',
            'csharp': 'cs',
            'golang': 'go',
            'rust': 'rs'
        };
        
        fileName.textContent = `script.${extensions[currentLang]}`;
        editor.session.setMode(`ace/mode/${currentLang}`);
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
        selectItems.classList.add('select-hide');
        selectSelected.classList.remove('select-arrow-active');
    }
});

// Copy button
copyBtn.addEventListener('click', () => {
    const code = editor.getValue();
    navigator.clipboard.writeText(code).then(() => {
        copyBtn.classList.add('copied');
        const icon = copyBtn.querySelector('i');
        icon.className = 'fa-solid fa-check';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            icon.className = 'fa-solid fa-copy';
        }, 1500);
    });
});
