/**
 * Hanuruha Foundation Landing Page Logic
 * Pure JavaScript - No external dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set the Launch Date (e.g., 30 days from now)
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);

    const updateTimer = () => {
        const now = new Date().getTime();
        const diff = launchDate.getTime() - now;

        const els = {
            d: document.getElementById('days'),
            h: document.getElementById('hours'),
            m: document.getElementById('minutes'),
            s: document.getElementById('seconds'),
            container: document.getElementById('countdown')
        };

        // Safety check if elements exist
        if (!els.d) return;

        if (diff <= 0) {
            els.container.innerHTML = "<h3 class='text-white fw-bold'>FACILITY NOW OPEN</h3>";
            els.container.setAttribute('aria-label', 'The facility is now open');
            return;
        }

        // Calculations
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Update UI
        els.d.innerText = d.toString().padStart(2, '0');
        els.h.innerText = h.toString().padStart(2, '0');
        els.m.innerText = m.toString().padStart(2, '0');
        els.s.innerText = s.toString().padStart(2, '0');

        // Accessibility: Update the container's label periodically (e.g., every minute) 
        // to avoid screen readers reading every single second.
        if (s === 0 || els.container.getAttribute('aria-label') === 'Time remaining until launch') {
            els.container.setAttribute('aria-label', `Launching in ${d} days, ${h} hours, and ${m} minutes`);
        }
    };

    // Run every second
    setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
});