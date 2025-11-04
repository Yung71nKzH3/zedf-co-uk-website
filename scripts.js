/**
 * Universal JavaScript functions for index.html.
 * This file is responsible for the main dashboard interactivity (sidebars and mobile views).
 */

const BODY_MAIN = document.getElementById('body-main');
const STUFF_SIDEBAR = document.getElementById('stuff-sidebar');
const LINKS_SIDEBAR = document.getElementById('links-sidebar');
const MOBILE_CONTENT_PANE = document.getElementById('mobile-content-pane');
const MOBILE_CONTENT_INNER = document.getElementById('mobile-content-inner');
const STUFF_PANEL = document.getElementById('stuff-panel');
const LINKS_PANEL = document.getElementById('links-panel');

let activePanelId = null;

/**
 * Checks if the screen is mobile size.
 * @returns {boolean}
 */
function isMobile() {
    // Matches the CSS breakpoint (max-width: 768px)
    return window.innerWidth <= 768; 
}

/**
 * Injects content into the mobile pane for a single-view scroll experience.
 * @param {string} targetId - 'stuff' or 'links'
 */
function injectMobileContent(targetId) {
    const contentSourceId = `${targetId}-desktop-content`;
    const contentSource = document.getElementById(contentSourceId);
    
    // Get desktop content and modify grid layout for mobile
    let mobileContent = contentSource.innerHTML;
    // Ensure single column grid for mobile is selected for the injected content
    mobileContent = mobileContent.replace('grid-cols-2', 'grid-cols-1');
    
    MOBILE_CONTENT_INNER.innerHTML = mobileContent;
}

/**
 * Toggles the specified content view open or closed based on device size.
 * @param {string} targetId - 'stuff' or 'links'
 */
window.toggleSidebar = function(targetId) {
    const sidebar = targetId === 'stuff' ? STUFF_SIDEBAR : LINKS_SIDEBAR;
    const panel = targetId === 'stuff' ? STUFF_PANEL : LINKS_PANEL;
    const isOpening = !sidebar.classList.contains('active'); 

    if (isMobile()) {
        // --- MOBILE LOGIC (Scroll Collapse/Expand) ---
        
        if (isOpening) {
            injectMobileContent(targetId);
            
            // Close the other panel's visual active state
            STUFF_PANEL.classList.remove('active');
            LINKS_PANEL.classList.remove('active');
            
            // Open the current content pane
            MOBILE_CONTENT_PANE.classList.add('active');
            
            // Set current active state
            sidebar.classList.add('active');
            panel.classList.add('active'); 
            activePanelId = targetId;

        } else {
            // If closing, collapse the pane
            MOBILE_CONTENT_PANE.classList.remove('active');
            sidebar.classList.remove('active');
            panel.classList.remove('active'); 
            activePanelId = null;
        }
        
    } else {
        // --- DESKTOP LOGIC (Floating Pop-ups) ---
        
        // Ensure only one sidebar is open at a time (if opening one, close the other)
        if (isOpening) {
            const otherTargetId = targetId === 'stuff' ? 'links' : 'stuff';
            const otherSidebar = otherTargetId === 'stuff' ? LINKS_SIDEBAR : STUFF_SIDEBAR;
            const otherPanel = otherTargetId === 'stuff' ? LINKS_PANEL : STUFF_PANEL;

            if (otherSidebar && otherSidebar.classList.contains('active')) {
                otherSidebar.classList.remove('active');
                otherPanel.classList.remove('active'); 
                BODY_MAIN.classList.remove(`${otherTargetId}-active`);
            }
        }
        
        // Toggle the current sidebar
        sidebar.classList.toggle('active');
        panel.classList.toggle('active');

        // Toggle the main body state class 
        BODY_MAIN.classList.toggle(`${targetId}-active`, isOpening);
    }
}


// =========================================================================
// --- PARTICLE ANIMATION SCRIPT ---
// =========================================================================

// --- Configuration (Moved to Global Scope for Visibility) ---
const TARGET_TEXT = "w1ll0w";
const PARTICLE_COLOR = '#06b6d4'; 
const RESOLUTION = 4; 
const HOVER_AREA_RADIUS = 200; 
    
// Physics constants (Can be global, as they apply regardless of size)
const FRICTION = 0.9;
const SPRING = 0.08; 
const DRIFT_SPEED = 0.005; 
    
// Dynamic variables initialized globally
let TEXT_SIZE = 120; 
let particles = [];
let mouse = { x: 0, y: 0, isHovering: false };
    
// State management
let isFormed = false;
let textMetrics = { width: 0, height: TEXT_SIZE, textX: 0, textY: 0 }; 
let box = { x: 0, y: 0, w: 0, h: 0 }; // The confined area

// --- Setup Canvas and Context ---
let canvas = null;
let ctx = null;

/**
 * Selects the correct canvas and context based on current screen size.
 * Returns the active canvas element.
 */
function initializeCanvas() {
    if (window.innerWidth <= 768) {
        // Mobile
        canvas = document.getElementById('mobileCanvas');
        document.getElementById('desktopCanvas').style.display = 'none';
    } else {
        // Desktop
        canvas = document.getElementById('desktopCanvas');
        document.getElementById('mobileCanvas').style.display = 'none';
    }
    ctx = canvas.getContext('2d');
    return canvas;
}

/**
 * Determines configuration based on screen width.
 */
function getResponsiveConfig() {
    if (window.innerWidth <= 768) {
        // Mobile Configuration: Large size relative to 300px header height
        return {
            size: 80, 
            yFactor: 0.45 // Adjusted to move title up within the 300px header area
        };
    } else {
        // Desktop Configuration
        return {
            size: 120,
            yFactor: 0.2 // Place at 20% down the screen
        };
    }
}

    
// --- Resize Handler ---
function resizeCanvas() {
    const activeCanvas = initializeCanvas();

    // Set canvas size based on its determined role
    if (window.innerWidth <= 768) {
        // Mobile: Only resize the active (mobile) canvas to its fixed header dimensions
        activeCanvas.width = window.innerWidth;
        activeCanvas.height = 300; // Fixed height defined in CSS
    } else {
        // Desktop: Resize the active (desktop) canvas to full viewport
        activeCanvas.width = window.innerWidth;
        activeCanvas.height = window.innerHeight;
    }
    
    const config = getResponsiveConfig();
    TEXT_SIZE = config.size;
    
    // Calculate Y position relative to the active canvas height
    textMetrics.textY = activeCanvas.height * config.yFactor;
    textMetrics.height = TEXT_SIZE;

    mapTextToParticles();
}
window.addEventListener('resize', resizeCanvas);
    
// --- Particle Class ---
class Particle {
    constructor(targetX, targetY, shape) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.shape = shape;

        // Initial position within the confined box
        this.x = box.x + Math.random() * box.w;
        this.y = box.y + Math.random() * box.h;

        // Initial drift target (for SCATTER mode)
        this.initialX = this.x;
        this.initialY = this.y;

        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 2 + 1; 
    }

    update() {
        let targetX, targetY;
        
        if (isFormed) {
            // FORM Mode: Seek text pixel coordinates
            targetX = this.targetX;
            targetY = this.targetY;
        } else {
            // SCATTER Mode: Seek random drift position within the box
            
            // Slowly update the scatter target to create subtle movement
            if (Math.random() < DRIFT_SPEED) {
                this.initialX = box.x + Math.random() * box.w;
                this.initialY = box.y + Math.random() * box.h;
            }
            targetX = this.initialX;
            targetY = this.initialY;
        }
        
        // 1. Calculate Snap-to-Target Force
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        this.vx += dx * SPRING;
        this.vy += dy * SPRING;
        
        // 2. Apply Friction
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        // 3. Update Position
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = PARTICLE_COLOR;
        
        // Ensure size is slightly randomized for visual interest
        const s = this.size;

        ctx.beginPath();
        if (this.shape === 'square') {
            ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
        } else if (this.shape === 'circle') {
            ctx.arc(this.x, this.y, s / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'triangle') {
            // Simple equilateral triangle pointing up
            ctx.moveTo(this.x, this.y - s);
            ctx.lineTo(this.x - s, this.y + s);
            ctx.lineTo(this.x + s, this.y + s);
            ctx.closePath();
            ctx.fill();
        }
    }
}
    
// --- Formation Control (Unchanged) ---
function startFormation() {
    if (isFormed) return;
    isFormed = true;
}
    
function breakApart() {
    if (!isFormed) return;
    isFormed = false;

    // Reset particle drift targets instantly to ensure quick breakup
    particles.forEach(p => {
        p.initialX = box.x + Math.random() * box.w;
        p.initialY = box.y + Math.random() * box.h;
    });
}
    
// --- Text Mapping Function (Updated to use dynamic TEXT_SIZE) ---
function mapTextToParticles() {
    particles = []; // Clear existing
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // 1. Measure and Draw the target text (hidden)
    tempCtx.font = `${TEXT_SIZE}px 'Inter', sans-serif`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    
    textMetrics.textX = tempCanvas.width / 2;
    textMetrics.textY = textMetrics.textY; // Use pre-calculated Y
    textMetrics.width = tempCtx.measureText(TARGET_TEXT).width;
    
    tempCtx.fillStyle = 'white';
    tempCtx.fillText(TARGET_TEXT, textMetrics.textX, textMetrics.textY);
    
    // 2. Define the confined box area (100px padding around the text area)
    const boxMargin = 100;
    box.x = textMetrics.textX - textMetrics.width / 2 - boxMargin;
    box.y = textMetrics.textY - TEXT_SIZE / 2 - boxMargin;
    box.w = textMetrics.width + 2 * boxMargin;
    box.h = TEXT_SIZE + 2 * boxMargin;

    // 3. Get pixel data
    const data = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
    const shapes = ['square', 'circle', 'triangle'];
    
    // 4. Iterate through pixels and create particles
    for (let y = 0; y < tempCanvas.height; y += RESOLUTION) {
        for (let x = 0; x < tempCanvas.width; x += RESOLUTION) {
            const index = (y * tempCanvas.width + x) * 4;
            
            if (data[index + 3] > 0) { // If pixel is part of the text
                const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
                particles.push(new Particle(x, y, randomShape));
            }
        }
    }
}
    
// --- Animation Loop (FULL CLEAR FIX) ---
function animate() {
    /* * CRITICAL FIX: To prevent permanent trails and maintain full background 
     * transparency, clear the entire active canvas using a transparent fill color.
     */
    
    if (!ctx) return; // safety check 

    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; 
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

// --- Event Listeners (Unchanged) ---
window.addEventListener('mousemove', (e) => {
    if (!ctx) return; // safety check
    
    // Determine mouse position relative to the active canvas
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    
    // For mobile, the fixed canvas element will have an offset if the user has scrolled.
    // Since the mobile canvas is fixed, this simplifies things, but we use the clientX/Y
    // relative to the viewport top/left, which works for fixed/full-screen canvases.
    
    mouse.x = mouseX;
    mouse.y = mouseY;

    // Calculate distance to the center of the text area
    const dx = mouse.x - textMetrics.textX;
    const dy = mouse.y - textMetrics.textY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Check if the mouse is close enough to trigger formation
    if (dist < HOVER_AREA_RADIUS) {
        if (!isFormed) {
            startFormation();
        }
    } else {
        // If the user moves out of the area, break it apart immediately
        if (isFormed) {
            breakApart();
        }
    }
});
    
// Start the process
window.onload = function () {
    // Initial call to set up the correct canvas and mapping
    resizeCanvas(); 
    animate();
};
    
// Handle initial load in case load event already fired
if (document.readyState === 'complete') {
    window.onload();
}