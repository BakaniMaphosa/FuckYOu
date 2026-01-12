
export function initAIChat(container) {
    const roadmapToggle = container.querySelector('#roadmap-toggle') || document.getElementById('roadmap-toggle');
    const roadmapPanel = container.querySelector('#roadmap-panel') || document.getElementById('roadmap-panel');
    const sendBtn = container.querySelector('#send-btn') || document.getElementById('send-btn');
    const userInput = container.querySelector('#user-input') || document.getElementById('user-input');
    const chatBox = container.querySelector('#chat-box') || document.getElementById('chat-box');
    const pinnedBar = container.querySelector('#pinned-bar') || document.getElementById('pinned-bar');
    let pinCounter = 0;

    if (roadmapToggle && roadmapPanel) {
        roadmapToggle.onclick = () => { roadmapPanel.classList.toggle('active'); };
    }

    function addMessage(text, isUser = false) {
        if (!chatBox) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        const messageId = `msg-${pinCounter++}`;
        msgDiv.innerHTML = `${isUser ? '' : `<img src="/ViewTypes/AIchat/AITutorIcon.svg" class="avatar-img">`}<div class="bubble">${text}${isUser ? '' : `<i class='bx bx-pin pin-btn-action' data-target="${messageId}"></i>`}</div>`;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (sendBtn && userInput) {
        sendBtn.onclick = () => {
            if (userInput.value.trim()) {
                addMessage(userInput.value, true);
                userInput.value = '';
                setTimeout(() => { addMessage("Try pinning this! If you pin many, the bar above will scroll."); }, 600);
            }
        };
        userInput.onkeypress = (e) => { if(e.key === 'Enter') sendBtn.click(); };
    }

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('pin-btn-action')) {
            const btn = e.target;
            const id = btn.getAttribute('data-target');
            if (btn.classList.contains('is-pinned')) {
                btn.classList.remove('is-pinned');
                const existingTab = pinnedBar ? pinnedBar.querySelector(`.pinned-tab[data-id="${id}"]`) : null;
                if (existingTab) existingTab.remove();
            } else {
                btn.classList.add('is-pinned');
                const snippet = btn.parentElement.innerText.substring(0, 15) + "...";
                const tab = document.createElement('div');
                tab.className = 'pinned-tab';
                tab.setAttribute('data-id', id);
                tab.innerHTML = `<i class='bx bxs-pin'></i> <span>${snippet}</span>`;
                tab.onclick = () => { btn.classList.remove('is-pinned'); tab.remove(); };
                if (pinnedBar) {
                    pinnedBar.appendChild(tab);
                    // Auto-scroll to the newest pin
                    pinnedBar.scrollTo({ left: pinnedBar.scrollWidth, behavior: 'smooth' });
                }
            }
        }
    });
}
