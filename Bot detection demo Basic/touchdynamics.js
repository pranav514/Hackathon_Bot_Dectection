// touchDynamics.js

let touchData = [];
let prevTouchTime, prevTouchX, prevTouchY, prevTouchVelocity = 0, prevTouchAcceleration = 0;
let detectionDone = false;

// Add touch event listeners
window.addEventListener('touchstart', (e) => {
    if (detectionDone) return;

    prevTouchTime = performance.now();
    prevTouchX = e.touches[0].clientX;
    prevTouchY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
    if (detectionDone) return;

    let currentTime = performance.now();
    let x = e.touches[0].clientX;
    let y = e.touches[0].clientY;

    if (prevTouchTime !== undefined) {
        let deltaTime = (currentTime - prevTouchTime) / 1000;
        let deltaX = x - prevTouchX;
        let deltaY = y - prevTouchY;

        let traveledDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        let direction = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        let straightness = Math.abs(deltaX / traveledDistance);

        let velocity = traveledDistance / deltaTime;
        let acceleration = (velocity - prevTouchVelocity) / deltaTime;
        let jerk = (acceleration - prevTouchAcceleration) / deltaTime;

        touchData.push({ traveledDistance, deltaTime, direction, straightness, acceleration, jerk });

        prevTouchVelocity = velocity;
        prevTouchAcceleration = acceleration;

        if (touchData.length > 50) {
            detectUserOrBot();
        }
    }

    prevTouchTime = currentTime;
    prevTouchX = x;
    prevTouchY = y;
});

window.addEventListener('touchend', () => {
    if (touchData.length > 0) {
        detectUserOrBot();
    }
});

function calculateRealTimeTouchFeatures(data) {
    let sumDistance = data.reduce((acc, val) => acc + val.traveledDistance, 0);
    let totalTime = data.reduce((acc, val) => acc + val.deltaTime, 0);
    let avgStraightness = data.reduce((acc, val) => acc + val.straightness, 0) / data.length;
    let avgDirection = data.reduce((acc, val) => acc + val.direction, 0) / data.length;
    let avgAcceleration = data.reduce((acc, val) => acc + val.acceleration, 0) / data.length;
    let avgJerk = data.reduce((acc, val) => acc + val.jerk, 0) / data.length;

    return { traveled_distance_pixel: sumDistance, elapsed_time: totalTime, straightness: avgStraightness, direction_of_movement: avgDirection, acceleration: avgAcceleration, jerk: avgJerk };
}

// Ensure detectUserOrBot function is available globally or import it from the main script
function detectUserOrBot() {
    let realTimeFeatures = calculateRealTimeTouchFeatures(touchData);

    let closestCluster = centroids[0];
    let minDistance = calculateEuclideanDistance(realTimeFeatures, centroids[0]);

    for (let i = 1; i < centroids.length; i++) {
        let distance = calculateEuclideanDistance(realTimeFeatures, centroids[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closestCluster = centroids[i];
        }
    }

    if (closestCluster.cluster >= 0 && closestCluster.cluster <= 9) {
        updateVerificationBox(true); // Legitimate user
    } else {
        updateVerificationBox(false); // Bot detected
    }
}

// Ensure updateVerificationBox function is available globally or import it from the main script
function updateVerificationBox(isLegitimateUser) {
    const checkbox = document.getElementById('verified');
    const statusLabel = document.getElementById('verification-status');
    const submitButton = document.getElementById('submit-btn');

    if (isLegitimateUser) {
        checkbox.checked = true;
        statusLabel.textContent = "Verified User";
        statusLabel.style.color = "green";
        submitButton.disabled = false; // Enable submit button
    } else {
        checkbox.checked = false;
        statusLabel.textContent = "Bot Detected";
        statusLabel.style.color = "red";
        submitButton.disabled = true; // Keep submit button disabled
    }
}
