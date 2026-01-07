import { toolbarLogic } from "/Navbar/studyTool/script2.js";

async function loadComponent(targetId, file) {
    const html = await fetch(file).then(res => res.text());
    document.getElementById(targetId).innerHTML = html;
}

const nav = document.getElementById('mainNav');
const navTrigger = document.querySelector('.navbar-trigger');

// ============================================
// NAVBAR HOVER REVEAL
// ============================================
let hideTimeout;

// HOVER TO REVEAL NAVBAR
navTrigger.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    nav.classList.add('visible');
});

// Keep navbar visible while hovering
nav.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    nav.classList.add('visible');
});

// Hide navbar after leaving
nav.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
        nav.classList.remove('visible');
    }, 500); // Wait 500ms before hiding
});

navTrigger.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
        nav.classList.remove('visible');
    }, 500);
});

// ============================================
// SLIDER FUNCTIONALITY
// ============================================
const sliderBtns = document.querySelectorAll('.slider-btn');
const sliderBg = document.getElementById('sliderBg');
const sliderSection = document.getElementById('sliderSection');

// Initialize slider background position
function updateSlider(btn) {
    const rect = btn.getBoundingClientRect();
    const parentRect = sliderSection.getBoundingClientRect();
    
    sliderBg.style.width = rect.width + 'px';
    sliderBg.style.left = (rect.left - parentRect.left) + 'px';
}

// Set initial position after a short delay (wait for navbar to render)
setTimeout(() => {
    const activeBtn = document.querySelector('.slider-btn.active');
    if (activeBtn) updateSlider(activeBtn);
}, 100);

// Set initial trigger position (notes tab is active by default)
if (navTrigger) {
    navTrigger.classList.add('notes-active');
}

// Click handler
sliderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sliderBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSlider(btn);
        
        const tab = btn.getAttribute('data-tab');
        console.log('Switched to:', tab);
        
        const sliderBar = document.querySelector('.slider-bar');
        const navSide = document.querySelector('.nav-side');
        const tabContent = document.getElementById('tabContent');
        
        // Add fade-out class
        tabContent.classList.add('fade-out');
        
        // Wait for fade-out, then swap content
        setTimeout(() => {
            if (tab === 'notes') {
                // NOTES TAB
                navTrigger.classList.add('notes-active'); // ✅ ADD CLASS
                
                tabContent.innerHTML = `
                    <div class="search-row">
                        <div style="width: 450px; height: 45px; background: transparent;"></div>
                        <div class="search-wrap">
                            <i class="fa-solid fa-search"></i>
                            <input type="text" placeholder="SEARCH PORTFOLIO...">
                        </div>
                    </div>

                    <div class="carousel-viewport" id="viewport">
                        <div class="track">
                            <div class="biz-card">
                                <div class="firm">Pierce & Pierce</div>
                                <div class="name">Paul Allen</div>
                            </div>
                            <div class="biz-card">
                                <div class="firm">Pierce & Pierce</div>
                                <div class="name">Patrick Bateman</div>
                            </div>
                            <div class="biz-card">
                                <div class="firm">Pierce & Pierce</div>
                                <div class="name">Timothy Bryce</div>
                            </div>
                            <div class="biz-card">
                                <div class="firm">Pierce & Pierce</div>
                                <div class="name">David Van Patten</div>
                            </div>
                            <div class="biz-card">
                                <div class="firm">Mergers & Acq.</div>
                                <div class="name">M. Halberstram</div>
                            </div>
                            <div class="biz-card">
                                <div class="firm">Mergers & Acq.</div>
                                <div class="name">M. Halberstram</div>
                            </div>
                            <div class="biz-card">
                                <div class="firm">Mergers & Acq.</div>
                                <div class="name">M. Halberstram</div>
                            </div>
                        </div>
                    </div>
                `;
                
                if (navSide) navSide.style.display = 'flex';
                if (sliderBar) sliderBar.style.marginLeft = "0vh";
                
                // Remove fade-out after content loads
                requestAnimationFrame(() => {
                    tabContent.classList.remove('fade-out');
                    
                    // ✅ TRIGGER CAROUSEL SLIDE-IN FROM RIGHT
                    setTimeout(() => {
                        const viewport = document.getElementById('viewport');
                        if (viewport) viewport.classList.add('show');
                    }, 50);
                });
                
                initializeCarouselDrag();
                
            } else if (tab === 'tools' ) {
                // TOOLS TAB
                navTrigger.classList.remove('notes-active'); // ✅ REMOVE CLASS
                
                if (navSide) navSide.style.display = 'none';
                if (sliderBar) sliderBar.style.marginLeft = "13.8vh";
              
                loadComponent("tabContent", "/Navbar/studyTool/another.html").then(() => {
                    // Remove fade-out after component loads
                    requestAnimationFrame(() => {
                        tabContent.classList.remove('fade-out');
                    });
                    
                    setTimeout(() => {
                        toolbarLogic();
                    }, 100);
                });

                console.log("Switched to:", tab);
            }else if( tab === 'ai' || tab === 'other'){
                   console.log("Nothing here yet")
            }
        }, 300); // Match CSS transition time
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    const active = document.querySelector('.slider-btn.active');
    if (active) updateSlider(active);
});

// ============================================
// CAROUSEL DRAG FUNCTIONALITY
// ============================================
function initializeCarouselDrag() {
    const viewport = document.getElementById('viewport');
    
    if (!viewport) return;
    
    // ✅ ADD 'show' CLASS FOR INITIAL PAGE LOAD
    setTimeout(() => {
        viewport.classList.add('show');
    }, 100);
    
    let isDown = false;
    let startX;
    let scrollLeft;

    viewport.addEventListener('mousedown', (e) => {
        isDown = true;
        viewport.classList.add('active');
        startX = e.pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
        e.preventDefault();
    });

    viewport.addEventListener('mouseleave', () => {
        isDown = false;
        viewport.classList.remove('active');
    });

    viewport.addEventListener('mouseup', () => {
        isDown = false;
        viewport.classList.remove('active');
    });

    viewport.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX) * 3;
        viewport.scrollLeft = scrollLeft - walk;
    });
}

// Initialize carousel drag on page load
initializeCarouselDrag();