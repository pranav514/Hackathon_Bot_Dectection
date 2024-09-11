let mouseData = [];
let prevTime, prevX, prevY, prevVelocity = 0, prevAcceleration = 0;
let detectionDone = false;
let isMobileOrTablet = false;
let requestCount = 0;
const RATE_LIMIT = 100;
const TIME_WINDOW = 60000;
let startTime = Date.now();

const centroids = [
    { cluster: 0, traveled_distance_pixel: 411.45, elapsed_time: 1.607, straightness: 0.745, direction_of_movement: 4.00, acceleration: 709.39, jerk: 5523.58 },
    { cluster: 1, traveled_distance_pixel: 2273.14, elapsed_time: 1.185, straightness: 0.387, direction_of_movement: 4.00, acceleration: 1901186.95, jerk: 203441265.80 },
    { cluster: 2, traveled_distance_pixel: 2937.47, elapsed_time: 1.935, straightness: 0.276, direction_of_movement: 2.50, acceleration: 85958.02, jerk: -36311176.77 },
    { cluster: 3, traveled_distance_pixel: 1762.55, elapsed_time: 2.200, straightness: 0.424, direction_of_movement: 3.00, acceleration: 269711.61, jerk: 21804720.09 },
    { cluster: 4, traveled_distance_pixel: 3930.85, elapsed_time: 5.897, straightness: 0.129, direction_of_movement: 4.00, acceleration: 279925.13, jerk: -3014929.69 },
    { cluster: 5, traveled_distance_pixel: 2282.23, elapsed_time: 1.607, straightness: 0.563, direction_of_movement: 4.00, acceleration: 632656.07, jerk: 57527136.55 },
    { cluster: 6, traveled_distance_pixel: 314.02, elapsed_time: 1.466, straightness: 0.764, direction_of_movement: 1.00, acceleration: 570.05, jerk: 3848.59 },
    { cluster: 7, traveled_distance_pixel: 941.58, elapsed_time: 1.576, straightness: 0.666, direction_of_movement: 4.00, acceleration: 81481.86, jerk: 7995421.02 },
    { cluster: 8, traveled_distance_pixel: 393.63, elapsed_time: 1.591, straightness: 0.726, direction_of_movement: 6.00, acceleration: 665.89, jerk: 4921.96 },
    { cluster: 9, traveled_distance_pixel: 2117.15, elapsed_time: 2.278, straightness: 0.271, direction_of_movement: 2.00, acceleration: 571208.70, jerk: 48510435.64 }
];

window.addEventListener('DOMContentLoaded', (event) => {
    detectDeviceType();
});

function detectDeviceType() {
    const userAgent = navigator.userAgent;
    isMobileOrTablet = /Mobi|Android|iPhone|iPad|iPod/.test(userAgent);
}

let debounceTimer;
window.addEventListener('mousemove', (e) => {
    if (detectionDone || isMobileOrTablet) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        let currentTime = performance.now();
        let x = e.clientX;
        let y = e.clientY;

        if (prevTime !== undefined) {
            let deltaTime = (currentTime - prevTime) / 1000;
            let deltaX = x - prevX;
            let deltaY = y - prevY;

            let traveledDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            let direction = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            let straightness = Math.abs(deltaX / traveledDistance);

            let velocity = traveledDistance / deltaTime;
            let acceleration = (velocity - prevVelocity) / deltaTime;
            let jerk = (acceleration - prevAcceleration) / deltaTime;

            mouseData.push({ traveledDistance, deltaTime, direction, straightness, acceleration, jerk });

            prevVelocity = velocity;
            prevAcceleration = acceleration;

            if (mouseData.length > 50) {
                detectUserOrBot();
            }
        }

        prevTime = currentTime;
        prevX = x;
        prevY = y;
    }, 100); // Debounce time (100ms)
});

function calculateRealTimeFeatures(data) {
    let sumDistance = data.reduce((acc, val) => acc + val.traveledDistance, 0);
    let totalTime = data.reduce((acc, val) => acc + val.deltaTime, 0);
    let avgStraightness = data.reduce((acc, val) => acc + val.straightness, 0) / data.length;
    let avgDirection = data.reduce((acc, val) => acc + val.direction, 0) / data.length;
    let avgAcceleration = data.reduce((acc, val) => acc + val.acceleration, 0) / data.length;
    let avgJerk = data.reduce((acc, val) => acc + val.jerk, 0) / data.length;

    return { traveled_distance_pixel: sumDistance, elapsed_time: totalTime, straightness: avgStraightness, direction_of_movement: avgDirection, acceleration: avgAcceleration, jerk: avgJerk };
}

function calculateEuclideanDistance(realTimeFeatures, centroid) {
    return Math.sqrt(
        (realTimeFeatures.traveled_distance_pixel - centroid.traveled_distance_pixel) ** 2 +
        (realTimeFeatures.elapsed_time - centroid.elapsed_time) ** 2 +
        (realTimeFeatures.straightness - centroid.straightness) ** 2 +
        (realTimeFeatures.direction_of_movement - centroid.direction_of_movement) ** 2 +
        (realTimeFeatures.acceleration - centroid.acceleration) ** 2 +
        (realTimeFeatures.jerk - centroid.jerk) ** 2
    );
}

function detectUserOrBot() {
    if (detectionDone) return;

    let isLegitimateUser = true;

    if (!isMobileOrTablet) {
        let realTimeFeatures = calculateRealTimeFeatures(mouseData);

        let closestCluster = centroids[0];
        let minDistance = calculateEuclideanDistance(realTimeFeatures, centroids[0]);

        for (let i = 1; i < centroids.length; i++) {
            let distance = calculateEuclideanDistance(realTimeFeatures, centroids[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestCluster = centroids[i];
            }
        }

        isLegitimateUser = closestCluster.cluster >= 0 && closestCluster.cluster <= 9;
    }

    if (isLegitimateUser) {
        isLegitimateUser = checkAdditionalEnvironmentalFactors();
    }

    detectionDone = true;
    updateVerificationBox(isLegitimateUser);
}

function checkAdditionalEnvironmentalFactors() {
    let rateLimited = checkRateLimiting();
    let ipCheckPassed = checkIPReputation();
    let browserCheckPassed = checkBrowserFingerprint();

    return !rateLimited && ipCheckPassed && browserCheckPassed;
}

function checkRateLimiting() {
    const currentTime = Date.now();

    if (currentTime - startTime > TIME_WINDOW) {
        requestCount = 0;
        startTime = currentTime;
    }

    requestCount++;

    return requestCount > RATE_LIMIT;
}

function checkIPReputation() {
    // Implementation for IP address reputation check
    return true; // Example return value
}

function checkBrowserFingerprint() {
    // Implementation for browser fingerprint check
    return true; // Example return value
}

function updateVerificationBox(isLegitimateUser) {
    const checkbox = document.getElementById('verified');
    const statusLabel = document.getElementById('verification-status');
    const submitButton = document.getElementById('submit-btn');

    if (isLegitimateUser) {
        checkbox.checked = true;
        statusLabel.textContent = "Verified User";
        statusLabel.style.color = "green";
        submitButton.disabled = false;
    } else {
        checkbox.checked = false;
        statusLabel.textContent = "Bot Detected!";
        statusLabel.style.color = "red";
        submitButton.disabled = true;
    }
}

document.getElementById('signInForm').addEventListener('submit', (e) => {
    if (!document.getElementById('verified').checked) {
        e.preventDefault();
        alert('Form submission blocked: Bot detected.');
    } else {
        alert('Form submitted successfully.');
    }
});
