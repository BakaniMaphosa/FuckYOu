import { toolbarLogic } from "/Navbar/studyTool/script2.js";

export function toolBarLogic(){
    async function loadComponent(targetId, file) {
        const html = await fetch(file).then(res => res.text());
        document.getElementById(targetId).innerHTML = html;
    }

    async function loadComponentByClass(targetClass, file) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        
        const html = await res.text();
        
        // Select all elements with the specific class
        const targets = document.querySelectorAll(`.${targetClass}`);
        
        if (targets.length > 0) {
            targets.forEach(target => {
                target.innerHTML = html;
            });
        } else {
            console.warn(`No elements found with class: ${targetClass}`);
        }
    } catch (err) {
        console.error(err);
    }
}

    const nav = document.getElementById('mainNav');
    const navTrigger = document.querySelector('.navbar-trigger');

    // ============================================
    // NAVBAR HOVER REVEAL
    // ============================================
    let hideTimeout;

    // ✅ Trigger button reveals navbar
    navTrigger.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        nav.classList.add('visible');
    });

    navTrigger.addEventListener('mouseleave', () => {
        const btn = document.querySelector('.action-btn');
        if (btn && btn.innerText.toUpperCase() === "PINNED") return;

        hideTimeout = setTimeout(() => {
            nav.classList.remove('visible');
        }, 500);
    });

    // ✅ Keep navbar open while hovering EXCEPT carousel
    nav.addEventListener('mouseenter', (e) => {
        // If hovering carousel, don't interfere
        if (e.target.closest('.carousel-viewport')) {
            return;
        }
        
        clearTimeout(hideTimeout);
        nav.classList.add('visible');
    });

    // ✅ Only hide when leaving navbar (except to carousel)
    nav.addEventListener('mouseleave', (e) => {
        // If moving to carousel, don't hide
        if (e.relatedTarget && e.relatedTarget.closest('.carousel-viewport')) {
            return;
        }
        
        // If moving to a submenu popup, don't hide
        if (e.relatedTarget && e.relatedTarget.closest('.submenu-popup')) {
            return;
        }
        if (e.relatedTarget && e.relatedTarget.closest('.ff-menu-container')) {
            return;
        }
        
        const btn = document.querySelector('.action-btn');
        if (btn && btn.innerText.toUpperCase() === "PINNED") return;

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
    const actionBtn = document.querySelector('.action-btn');

    function updateSlider(btn) {
        const rect = btn.getBoundingClientRect();
        const parentRect = sliderSection.getBoundingClientRect();
        
        sliderBg.style.width = rect.width + 'px';
        sliderBg.style.left = (rect.left - parentRect.left) + 'px';
    }

    setTimeout(() => {
        const activeBtn = document.querySelector('.slider-btn.active');
        if (activeBtn) updateSlider(activeBtn);
    }, 100);

    if (navTrigger) {
        navTrigger.classList.add('notes-active');
    }

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
            
            tabContent.classList.add('fade-out');
            
            setTimeout(() => {
                if (tab === 'notes') {
                    if (actionBtn) {
                        actionBtn.innerText = "Organize";
                        actionBtn.classList.remove('primary');
                        actionBtn.onclick = null;
                    }

                    navTrigger.classList.add('notes-active');
                    
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
                                <div class="biz-card note"></div>
                                <div class="biz-card project"></div>
                                <div class="biz-card note"></div>
                                <div class="biz-card project"></div>
                                <div class="biz-card note"></div>
                                <div class="biz-card project"></div>
                                <div class="biz-card note"></div>
                            </div>
                        </div>
                    `;
                    
                    loadComponentByClass("biz-card.note","/Navbar/NoteCards/NoteCard/NoteCard.html");
                    loadComponentByClass("biz-card.project","/Navbar/NoteCards/projectCard/ProjectCard.html");

                    if (navSide) navSide.style.display = 'flex';
                    if (sliderBar) sliderBar.style.marginLeft = "0vh";
                    
                    requestAnimationFrame(() => {
                        tabContent.classList.remove('fade-out');
                        
                        setTimeout(() => {
                            const viewport = document.getElementById('viewport');
                            if (viewport) viewport.classList.add('show');
                        }, 50);
                    });
                    
                    initializeCarouselDrag();
                    
                } else if (tab === 'tools' ) {
                    if (actionBtn) {
                        actionBtn.innerText = "Pin";
                        actionBtn.classList.remove('primary');
                        actionBtn.onclick = () => {
                            if (actionBtn.innerText.toUpperCase() === "PIN") {
                                actionBtn.innerText = "Pinned";
                                actionBtn.classList.add('primary');
                            } else {
                                actionBtn.innerText = "Pin";
                                actionBtn.classList.remove('primary');
                            }
                        };
                    }

                    navTrigger.classList.remove('notes-active');
                    
                    if (navSide) navSide.style.display = 'none';
                    if (sliderBar) sliderBar.style.marginLeft = "13.8vh";
                  
                    loadComponent("tabContent", "/Navbar/studyTool/another.html").then(() => {
                        requestAnimationFrame(() => {
                            tabContent.classList.remove('fade-out');
                        });
                        
                        setTimeout(() => {
                            toolbarLogic();
                        }, 100);
                    });
                } else if( tab === 'ai' || tab === 'other'){
                       console.log("Nothing here yet")
                }
            }, 300);
        });
    });


    window.addEventListener('resize', () => {
        const active = document.querySelector('.slider-btn.active');
        if (active) updateSlider(active);
    });

    function initializeCarouselDrag() {
        const viewport = document.getElementById('viewport');
        
        if (!viewport) return;
        
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

    initializeCarouselDrag();

    // ============================================
    // SUBMENU HOVER LOGIC (Treats submenus as part of navbar)
    // ============================================
    
    // 1. Keep navbar open when hovering submenus
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.submenu-popup') || e.target.closest('.ff-menu-container')) {
            clearTimeout(hideTimeout);
        }
    });

    // 2. Close navbar when leaving submenus
    document.addEventListener('mouseout', (e) => {
        const menu = e.target.closest('.submenu-popup') || e.target.closest('.ff-menu-container');
        if (menu) {
            // Ignore if moving inside the menu, back to navbar, or to another menu
            if (menu.contains(e.relatedTarget) || 
                (e.relatedTarget && e.relatedTarget.closest('#mainNav')) ||
                (e.relatedTarget && e.relatedTarget.closest('.submenu-popup')) ||
                (e.relatedTarget && e.relatedTarget.closest('.ff-menu-container'))) {
                return;
            }

            const btn = document.querySelector('.action-btn');
            if (btn && btn.innerText.toUpperCase() === "PINNED") return;

            hideTimeout = setTimeout(() => {
                nav.classList.remove('visible');
            }, 500);
        }
    });
}