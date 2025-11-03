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
