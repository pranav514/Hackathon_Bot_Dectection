function simulateMouseMovement() {
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    
    let event = new MouseEvent('mousemove', {
        clientX: x,
        clientY: y,
        bubbles: true
    });

    document.dispatchEvent(event);
}

// Simulate bot interaction
function simulateBotInteraction() {
    // Simulate mouse movements
    setInterval(simulateMouseMovement, 100); // Move every 100ms
}

// Start simulation
simulateBotInteraction();