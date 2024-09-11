let mouseData = [];
let touchData = [];
let prevTime, prevX, prevY, prevVelocity = 0, prevAcceleration = 0;
let prevTouchTime, prevTouchX, prevTouchY, prevTouchVelocity = 0, prevTouchAcceleration = 0;
let detectionDone = false;

// Updated Centroids data for bot detection
// const centroids = [
//     { cluster: 0, traveled_distance_pixel: 411.45, elapsed_time: 1.607, straightness: 0.745, direction_of_movement: 4.00, acceleration: 709.39, jerk: 5523.58 },
//     { cluster: 1, traveled_distance_pixel: 2273.14, elapsed_time: 1.185, straightness: 0.387, direction_of_movement: 4.00, acceleration: 1901186.95, jerk: 203441265.80 },
//     { cluster: 2, traveled_distance_pixel: 2937.47, elapsed_time: 1.935, straightness: 0.276, direction_of_movement: 2.50, acceleration: 85958.02, jerk: -36311176.77 },
//     { cluster: 3, traveled_distance_pixel: 1762.55, elapsed_time: 2.200, straightness: 0.424, direction_of_movement: 3.00, acceleration: 269711.61, jerk: 21804720.09 },
//     { cluster: 4, traveled_distance_pixel: 3930.85, elapsed_time: 5.897, straightness: 0.129, direction_of_movement: 4.00, acceleration: 279925.13, jerk: -3014929.69 },
//     { cluster: 5, traveled_distance_pixel: 2282.23, elapsed_time: 1.607, straightness: 0.563, direction_of_movement: 4.00, acceleration: 632656.07, jerk: 57527136.55 },
//     { cluster: 6, traveled_distance_pixel: 314.02, elapsed_time: 1.466, straightness: 0.764, direction_of_movement: 1.00, acceleration: 570.05, jerk: 3848.59 },
//     { cluster: 7, traveled_distance_pixel: 941.58, elapsed_time: 1.576, straightness: 0.666, direction_of_movement: 4.00, acceleration: 81481.86, jerk: 7995421.02 },
//     { cluster: 8, traveled_distance_pixel: 393.63, elapsed_time: 1.591, straightness: 0.726, direction_of_movement: 6.00, acceleration: 665.89, jerk: 4921.96 },
//     { cluster: 9, traveled_distance_pixel: 2117.15, elapsed_time: 2.278, straightness: 0.271, direction_of_movement: 2.00, acceleration: 571208.70, jerk: 48510435.64 }
// ];
const centroids = [
    { cluster: 0, traveled_distance_pixel: 2789.760416, elapsed_time: 14.321, straightness: 0.161122, direction_of_movement: 4.00, acceleration: 2919.638703, jerk: 160309.077550 },
    { cluster: 1, traveled_distance_pixel: 262.851759, elapsed_time: 1.092, straightness: 0.902790, direction_of_movement: 7.00, acceleration: 540.789971, jerk: 2921.849949 },
    { cluster: 2, traveled_distance_pixel: 214.241362, elapsed_time: 1.108, straightness: 0.903825, direction_of_movement: 1.00, acceleration: 483.263222, jerk: 2563.312079 },
    { cluster: 3, traveled_distance_pixel: 720.473979, elapsed_time: 3.042, straightness: 0.317795, direction_of_movement: 5.00, acceleration: 1067.830396, jerk: 12428.142185 },
    { cluster: 4, traveled_distance_pixel: 2261.731086, elapsed_time: 1.3495, straightness: 0.365378, direction_of_movement: 4.00, acceleration: 1016027.895050, jerk: 101438887.500000 },
    { cluster: 5, traveled_distance_pixel: 3244.632114, elapsed_time: 5.085, straightness: 0.180913, direction_of_movement: 3.00, acceleration: 195170.013600, jerk: -3804152.198000 },
    { cluster: 6, traveled_distance_pixel: 1635.123958, elapsed_time: 1.7865, straightness: 0.477574, direction_of_movement: 3.50, acceleration: 441328.745200, jerk: 43745998.625000 },
    { cluster: 7, traveled_distance_pixel: 895.051491, elapsed_time: 1.482, straightness: 0.721539, direction_of_movement: 4.00, acceleration: 94177.817450, jerk: 9264619.492000 },
    { cluster: 8, traveled_distance_pixel: 301.700031, elapsed_time: 1.186, straightness: 0.880857, direction_of_movement: 4.00, acceleration: 499.728658, jerk: 3201.885854 },
    { cluster: 9, traveled_distance_pixel: 596.258656, elapsed_time: 2.886, straightness: 0.336354, direction_of_movement: 1.00, acceleration: 807.729061, jerk: 7294.727523 }
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
const ANOMALY_THRESHOLD = 0.8;  // Simulating anomaly probability threshold (80%+ means bot)

// Simulate anomaly detection using a probability score (or real ML model output)
function simulateAnomalyScore(minDistance) {
    // For simplicity, we assume if the distance to the closest cluster exceeds the threshold,
    // the probability of the user being a bot increases.
    let normalizedDistance = Math.min(minDistance / DISTANCE_THRESHOLD, 1);
    
    // We return a score between 0 and 1, where a higher score indicates bot behavior
    return normalizedDistance;
}

function detectUserOrBot() {
    detectionDone = true;
    let data = mouseData.length > 0 ? mouseData : touchData;
    let realTimeFeatures = calculateRealTimeFeatures(data);

    let closestCluster = centroids[0];
    let minDistance = calculateEuclideanDistance(realTimeFeatures, centroids[0]);

    for (let i = 1; i < centroids.length; i++) {
        let distance = calculateEuclideanDistance(realTimeFeatures, centroids[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closestCluster = centroids[i];
        }
    }

    // Simulate anomaly detection using a scoring system
    let anomalyScore = simulateAnomalyScore(minDistance);

    // If the anomaly score exceeds a threshold, mark as bot, otherwise as a legitimate user
    if (anomalyScore > ANOMALY_THRESHOLD) {
        updateVerificationBox(false); // Bot detected
    } else {
        updateVerificationBox(true); // Legitimate user
    }
}



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

document.getElementById('signInForm').addEventListener('submit', (e) => {
    if (!document.getElementById('verified').checked) {
        e.preventDefault();
        alert('Form submission blocked: Bot detected.');
    } else {
        alert('Form submitted successfully.');
    }
});



// let mouseData = [];
// let prevTime, prevX, prevY, prevVelocity = 0, prevAcceleration = 0;
// let detectionDone = false;
// let requestCounter = 0;
// let requestStartTime = performance.now();

// const maxRequestsPerMinute = 100; // Adjust this threshold according to your needs

// // Centroid data for bot detection by median
// const centroids = [
//     { cluster: 0, traveled_distance_pixel: 411.45, elapsed_time: 1.607, straightness: 0.745, direction_of_movement: 4.00, acceleration: 709.39, jerk: 5523.58 },
//     { cluster: 1, traveled_distance_pixel: 2273.14, elapsed_time: 1.185, straightness: 0.387, direction_of_movement: 4.00, acceleration: 1901186.95, jerk: 203441265.80 },
//     { cluster: 2, traveled_distance_pixel: 2937.47, elapsed_time: 1.935, straightness: 0.276, direction_of_movement: 2.50, acceleration: 85958.02, jerk: -36311176.77 },
//     { cluster: 3, traveled_distance_pixel: 1762.55, elapsed_time: 2.200, straightness: 0.424, direction_of_movement: 3.00, acceleration: 269711.61, jerk: 21804720.09 },
//     { cluster: 4, traveled_distance_pixel: 3930.85, elapsed_time: 5.897, straightness: 0.129, direction_of_movement: 4.00, acceleration: 279925.13, jerk: -3014929.69 },
//     { cluster: 5, traveled_distance_pixel: 2282.23, elapsed_time: 1.607, straightness: 0.563, direction_of_movement: 4.00, acceleration: 632656.07, jerk: 57527136.55 },
//     { cluster: 6, traveled_distance_pixel: 314.02, elapsed_time: 1.466, straightness: 0.764, direction_of_movement: 1.00, acceleration: 570.05, jerk: 3848.59 },
//     { cluster: 7, traveled_distance_pixel: 941.58, elapsed_time: 1.576, straightness: 0.666, direction_of_movement: 4.00, acceleration: 81481.86, jerk: 7995421.02 },
//     { cluster: 8, traveled_distance_pixel: 393.63, elapsed_time: 1.591, straightness: 0.726, direction_of_movement: 6.00, acceleration: 665.89, jerk: 4921.96 },
//     { cluster: 9, traveled_distance_pixel: 2117.15, elapsed_time: 2.278, straightness: 0.271, direction_of_movement: 2.00, acceleration: 571208.70, jerk: 48510435.64 }
// ];

// // Capture mouse movements and calculate real-time features
// window.addEventListener('mousemove', (e) => {
//     if (detectionDone) return;

//     let currentTime = performance.now();
//     let x = e.clientX;
//     let y = e.clientY;

//     if (prevTime !== undefined) {
//         let deltaTime = (currentTime - prevTime) / 1000;
//         let deltaX = x - prevX;
//         let deltaY = y - prevY;

//         let traveledDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
//         let direction = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
//         let straightness = Math.abs(deltaX / traveledDistance);

//         let velocity = traveledDistance / deltaTime;
//         let acceleration = (velocity - prevVelocity) / deltaTime;
//         let jerk = (acceleration - prevAcceleration) / deltaTime;

//         mouseData.push({ traveledDistance, deltaTime, direction, straightness, acceleration, jerk });

//         prevVelocity = velocity;
//         prevAcceleration = acceleration;

//         if (mouseData.length > 50) {
//             detectUserOrBot();
//         }
//     }

//     prevTime = currentTime;
//     prevX = x;
//     prevY = y;
// });

// // Calculate real-time features from mouse data
// function calculateRealTimeFeatures(data) {
//     let sumDistance = data.reduce((acc, val) => acc + val.traveledDistance, 0);
//     let totalTime = data.reduce((acc, val) => acc + val.deltaTime, 0);
//     let avgStraightness = data.reduce((acc, val) => acc + val.straightness, 0) / data.length;
//     let avgDirection = data.reduce((acc, val) => acc + val.direction, 0) / data.length;
//     let avgAcceleration = data.reduce((acc, val) => acc + val.acceleration, 0) / data.length;
//     let avgJerk = data.reduce((acc, val) => acc + val.jerk, 0) / data.length;

//     return { traveled_distance_pixel: sumDistance, elapsed_time: totalTime, straightness: avgStraightness, direction_of_movement: avgDirection, acceleration: avgAcceleration, jerk: avgJerk };
// }

// // Calculate Euclidean distance between real-time features and centroids
// function calculateEuclideanDistance(realTimeFeatures, centroid) {
//     let distance = Math.sqrt(
//         (realTimeFeatures.traveled_distance_pixel - centroid.traveled_distance_pixel) ** 2 +
//         (realTimeFeatures.elapsed_time - centroid.elapsed_time) ** 2 +
//         (realTimeFeatures.straightness - centroid.straightness) ** 2 +
//         (realTimeFeatures.direction_of_movement - centroid.direction_of_movement) ** 2 +
//         (realTimeFeatures.acceleration - centroid.acceleration) ** 2 +
//         (realTimeFeatures.jerk - centroid.jerk) ** 2
//     );
//     return distance;
// }

// // Detect if the user is a bot or not based on centroid clustering and additional checks
// function detectUserOrBot() {
//     detectionDone = true;
//     let realTimeFeatures = calculateRealTimeFeatures(mouseData);

//     let closestCluster = centroids[0];
//     let minDistance = calculateEuclideanDistance(realTimeFeatures, centroids[0]);

//     for (let i = 1; i < centroids.length; i++) {
//         let distance = calculateEuclideanDistance(realTimeFeatures, centroids[i]);
//         if (distance < minDistance) {
//             minDistance = distance;
//             closestCluster = centroids[i];
//         }
//     }

//     if (closestCluster.cluster >= 0 && closestCluster.cluster <=  && checkEnvironmentalFactors()) {
//         updateVerificationBox(true); // Legitimate user
//     } else {
//         updateVerificationBox(false); // Bot detected
//     }
// }

// // Perform additional environmental checks like rate limiting and IP analysis
// function checkEnvironmentalFactors() {
//     if (!checkRateLimiting()) return false;
//     if (!checkIPAddress()) return false;
//     if (!checkBrowserFingerprint()) return false;

//     return true;
// }

// // Implement rate limiting based on request count and time
// function checkRateLimiting() {
//     requestCounter++;
//     let currentTime = performance.now();
//     let elapsedMinutes = (currentTime - requestStartTime) / (1000 * 60);

//     if (elapsedMinutes < 1) {
//         if (requestCounter > maxRequestsPerMinute) {
//             console.warn('Rate limit exceeded');
//             return false;
//         }
//     } else {
//         requestStartTime = currentTime;
//         requestCounter = 0; // Reset the counter after a minute
//     }
//     return true;
// }

// // Example IP address check (to be replaced with actual IP analysis logic)
// function checkIPAddress() {
//     // Replace this with an actual API call or server-side logic to check IP against known bot IPs
//     const userIP = '192.168.1.1'; // Example IP, replace with real IP detection logic

//     const knownBotIPs = ['192.168.1.2', '192.168.1.3']; // Example list of known bot IPs
//     if (knownBotIPs.includes(userIP)) {
//         console.warn('Suspicious IP address detected');
//         return false;
//     }
//     return true;
// }

// // Simple browser fingerprinting check
// function checkBrowserFingerprint() {
//     const userAgent = navigator.userAgent;
//     const languages = navigator.languages;
//     const platform = navigator.platform;

//     // Example fingerprint check logic
//     if (userAgent.includes('Headless') || platform === '') {
//         console.warn('Headless browser detected');
//         return false;
//     }

//     // Additional checks can be added here
//     return true;
// }

// // Update the verification box based on the detection result
// function updateVerificationBox(isLegitimateUser) {
//     const checkbox = document.getElementById('verified');
//     const statusLabel = document.getElementById('verification-status');
//     const submitButton = document.getElementById('submit-btn');

//     if (isLegitimateUser) {
//         checkbox.checked = true;
//         statusLabel.textContent = "Verified User";
//         statusLabel.style.color = "green";
//         submitButton.disabled = false; // Enable submit button
//     } else {
//         checkbox.checked = false;
//         statusLabel.textContent = "Bot Detected";
//         statusLabel.style.color = "red";
//         submitButton.disabled = true; // Disable submit button
//     }
// }

// // Additional checks and features can be implemented as needed
