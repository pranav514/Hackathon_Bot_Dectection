let mouseData = [];
let touchData = [];
let prevTime, prevX, prevY, prevVelocity = 0, prevAcceleration = 0;
let prevTouchTime, prevTouchX, prevTouchY, prevTouchVelocity = 0, prevTouchAcceleration = 0;
let detectionDone = false;

// Clustering on the basis of traveled_distance_pixel, elapsed_time, straightness, direction_of_movement, acceleration, jerk
const centroids = [
    { cluster: 0, traveled_distance_pixel: 2142.635463, elapsed_time: 2.160500, straightness: 0.339504, direction_of_movement: 3.00, acceleration: 414325.409950, jerk: 35897791.085000 },
    { cluster: 1, traveled_distance_pixel: 387.835308, elapsed_time: 1.545000, straightness: 0.742838, direction_of_movement: 4.00, acceleration: 761.187242, jerk: 6211.948858 }
];

// Mouse event listeners
window.addEventListener('mousemove', (e) => {
    if (detectionDone) return;

    let currentTime = performance.now();
    let x = e.clientX;
    let y = e.clientY;

    if (prevTime !== undefined) {
        let deltaTime = (currentTime - prevTime) / 1000;
        let deltaX = x - prevX;
        let deltaY = y - prevY;

        let traveledDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        let direction = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        let velocity = traveledDistance / deltaTime;
        let acceleration = (velocity - prevVelocity) / deltaTime;
        let jerk = Math.abs(deltaTime) > 0.001 ? (acceleration - prevAcceleration) / deltaTime : 0;

        mouseData.push({ traveledDistance, deltaTime, direction, x, y, acceleration, jerk });

        prevVelocity = velocity;
        prevAcceleration = acceleration;

        if (mouseData.length > 50) {
            detectUserOrBot();
        }
    }

    prevTime = currentTime;
    prevX = x;
    prevY = y;
});

// Touch event listeners
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
        let velocity = traveledDistance / deltaTime;
        let acceleration = (velocity - prevTouchVelocity) / deltaTime;
        let jerk = Math.abs(deltaTime) > 0.001 ? (acceleration - prevTouchAcceleration) / deltaTime : 0;

        touchData.push({ traveledDistance, deltaTime, direction, x, y, acceleration, jerk });

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

function calculateRealTimeFeatures(data) {
    let sumDistance = data.reduce((acc, val) => acc + val.traveledDistance, 0);
    let totalTime = data.reduce((acc, val) => acc + val.deltaTime, 0);
    let avgStraightness = calculateStraightness(data);
    let avgDirection = data.reduce((acc, val) => acc + val.direction, 0) / data.length;
    let avgAcceleration = data.reduce((acc, val) => acc + val.acceleration, 0) / data.length;
    let avgJerk = data.reduce((acc, val) => acc + val.jerk, 0) / data.length;

    return { traveled_distance_pixel: sumDistance, elapsed_time: totalTime, straightness: avgStraightness, direction_of_movement: avgDirection, acceleration: avgAcceleration, jerk: avgJerk };
}

// Calculate straightness for the full path
function calculateStraightness(data) {
    if (data.length === 0) return 0;
    let startX = data[0].x;
    let startY = data[0].y;
    let endX = data[data.length - 1].x;
    let endY = data[data.length - 1].y;

    let straightLineDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    let totalDistance = data.reduce((acc, val) => acc + val.traveledDistance, 0);

    return straightLineDistance / totalDistance;
}

function calculateEuclideanDistance(realTimeFeatures, centroid) {
    let distance = Math.sqrt(
        (realTimeFeatures.traveled_distance_pixel - centroid.traveled_distance_pixel) ** 2 +
        (realTimeFeatures.elapsed_time - centroid.elapsed_time) ** 2 +
        (realTimeFeatures.straightness - centroid.straightness) ** 2 +
        (realTimeFeatures.direction_of_movement - centroid.direction_of_movement) ** 2 +
        (realTimeFeatures.acceleration - centroid.acceleration) ** 2 +
        (realTimeFeatures.jerk - centroid.jerk) ** 2
    );
    return distance;
}

const DISTANCE_THRESHOLD = 1000; // Threshold to detect anomalies
const ANOMALY_THRESHOLD = 0.8;   // Simulating anomaly probability threshold (80%+ means bot)
const STRAIGHTNESS_THRESHOLD = 0.95;  // Threshold for detecting straight-line movement
const STRAIGHTNESS_BONUS = 0.2;       // Additional penalty for straight-line movement

// Simulate anomaly detection using a probability score
function calculateAnomalyScore(realTimeFeatures) {
    let distances = centroids.map((centroid) => calculateEuclideanDistance(realTimeFeatures, centroid));
    let minDistance = Math.min(...distances);

    let anomalyProbability = minDistance / DISTANCE_THRESHOLD; // Normalizing distance to get anomaly probability
    if (realTimeFeatures.straightness > STRAIGHTNESS_THRESHOLD) {
        anomalyProbability += STRAIGHTNESS_BONUS;
    }

    return { anomalyProbability, minDistance };
}

function detectUserOrBot() {
    let realTimeFeatures = calculateRealTimeFeatures(mouseData.length > 0 ? mouseData : touchData);
    let { anomalyProbability, minDistance } = calculateAnomalyScore(realTimeFeatures);

    const checkbox = document.getElementById('verified');
    const statusLabel = document.getElementById('verification-status');
    const submitButton = document.getElementById('submit-btn');

    if (anomalyProbability >= ANOMALY_THRESHOLD || minDistance >= DISTANCE_THRESHOLD) {
        statusLabel.textContent = "Bot Detected";
        statusLabel.style.color = "red";
        submitButton.disabled = true; // Disable submit button
    } else {
        checkbox.checked = true;
        statusLabel.textContent = "Verified User";
        statusLabel.style.color = "green";
        submitButton.disabled = false; // Enable submit button
    }

    detectionDone = true;
}

document.getElementById('signInForm').addEventListener('submit', (e) => {
    if (!document.getElementById('verified').checked) {
        e.preventDefault();
        alert('Form submission blocked: Bot detected.');
    } else {
        alert('Form submitted successfully.');
    }
});
