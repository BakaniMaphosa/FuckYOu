export function toolbarLogic(){
 
    const nav = document.getElementById('mainNav');

    // NAVBAR SCROLL
    window.addEventListener('scroll', () => {
        window.scrollY > 50 ? nav.classList.add('visible') : nav.classList.remove('visible');
    });

    // SLIDER
    const sliderBtns = document.querySelectorAll('.slider-btn');
    const sliderBg = document.getElementById('sliderBg');
    const sliderSection = document.getElementById('sliderSection');

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

    sliderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sliderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateSlider(btn);
        });
    });

    window.addEventListener('resize', () => {
        const active = document.querySelector('.slider-btn.active');
        if (active) updateSlider(active);
    });

    // TOOLS DRAG
    const toolsContainer = document.getElementById('toolsContainer');
    let isToolsDragging = false;
    let toolsStartX, toolsScrollLeft;

    toolsContainer.addEventListener('mousedown', (e) => {
        isToolsDragging = true;
        toolsStartX = e.pageX - toolsContainer.offsetLeft;
        toolsScrollLeft = toolsContainer.scrollLeft;
        e.preventDefault();
    });

    toolsContainer.addEventListener('mouseleave', () => {
        isToolsDragging = false;
    });

    toolsContainer.addEventListener('mouseup', () => {
        isToolsDragging = false;
    });

    toolsContainer.addEventListener('mousemove', (e) => {
        if (!isToolsDragging) return;
        e.preventDefault();
        const x = e.pageX - toolsContainer.offsetLeft;
        const walk = (x - toolsStartX) * 2;
        toolsContainer.scrollLeft = toolsScrollLeft - walk;
    });

    // ALIGN BUTTONS
    document.querySelectorAll('.align-slider').forEach(slider => {
        const buttons = slider.querySelectorAll('.align-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // ✅ INITIALIZE TOOLBAR FUNCTIONALITY
    import('/Navbar/studyTool/toolbarFunctionality.js')
        .then(module => {
            module.initializeToolbarFunctionality();
        })
        .catch(err => console.error("Failed to load toolbar functionality:", err));
}