export function initAIChat(container) {
    const roadmapToggle = container.querySelector('#roadmap-toggle-AIchat') || document.getElementById('roadmap-toggle-AIchat');
    const roadmapPanel = container.querySelector('#roadmap-panel-AIchat') || document.getElementById('roadmap-panel-AIchat');
    const sendBtn = container.querySelector('#send-btn-AIchat') || document.getElementById('send-btn-AIchat');
    const userInput = container.querySelector('#user-input-AIchat') || document.getElementById('user-input-AIchat');
    const chatBox = container.querySelector('#chat-box-AIchat') || document.getElementById('chat-box-AIchat');
    const pinnedBar = container.querySelector('#pinned-bar-AIchat') || document.getElementById('pinned-bar-AIchat');
    let pinCounter = 0;

    if (roadmapToggle && roadmapPanel) {
        roadmapToggle.onclick = () => { roadmapPanel.classList.toggle('active-AIchat'); };
    }

    function addMessage(text, isUser = false) {
        if (!chatBox) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message-AIchat ${isUser ? 'user-AIchat' : 'ai-AIchat'}`;
        const messageId = `msg-${pinCounter++}`;
        msgDiv.innerHTML = `${isUser ? '' : `<img src="/ViewTypes/AIchat/AITutorIcon.svg" class="avatar-img-AIchat">`}<div class="bubble-AIchat">${text}${isUser ? '' : `<i class='bx bx-pin pin-btn-action-AIchat' data-target="${messageId}"></i>`}</div>`;
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
        if (e.target.classList.contains('pin-btn-action-AIchat')) {
            const btn = e.target;
            const id = btn.getAttribute('data-target');
            if (btn.classList.contains('is-pinned-AIchat')) {
                btn.classList.remove('is-pinned-AIchat');
                const existingTab = pinnedBar ? pinnedBar.querySelector(`.pinned-tab-AIchat[data-id="${id}"]`) : null;
                if (existingTab) existingTab.remove();
            } else {
                btn.classList.add('is-pinned-AIchat');
                const snippet = btn.parentElement.innerText.substring(0, 15) + "...";
                const tab = document.createElement('div');
                tab.className = 'pinned-tab-AIchat';
                tab.setAttribute('data-id', id);
                tab.innerHTML = `<i class='bx bxs-pin'></i> <span>${snippet}</span>`;
                tab.onclick = () => { btn.classList.remove('is-pinned-AIchat'); tab.remove(); };
                if (pinnedBar) {
                    pinnedBar.appendChild(tab);
                    // Auto-scroll to the newest pin
                    pinnedBar.scrollTo({ left: pinnedBar.scrollWidth, behavior: 'smooth' });
                }
            }
        }
    });
}