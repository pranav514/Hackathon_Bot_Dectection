let mouseData = [];
let touchData = [];
let prevTime, prevX, prevY, prevVelocity = 0, prevAcceleration = 0;
let prevTouchTime, prevTouchX, prevTouchY, prevTouchVelocity = 0, prevTouchAcceleration = 0;
let detectionDone = false;

// Centroids from the training data
const centroids = [
  {
    cluster: 0,
    traveled_distance_pixel: 2800,
    elapsed_time: 14.96,
    straightness: 0.149552,
    direction_of_movement: 4.0,
    acceleration: 2300,
    jerk: 130000,
  },
  {
    cluster: 1,
    traveled_distance_pixel: 250,
    elapsed_time: 1.107,
    straightness: 0.9,
    direction_of_movement: 7.0,
    acceleration: 700,
    jerk: 4000,
  },
  {
    cluster: 2,
    traveled_distance_pixel: 220,
    elapsed_time: 1.139,
    straightness: 0.92,
    direction_of_movement: 1.0,
    acceleration: 600,
    jerk: 3500,
  },
  {
    cluster: 3,
    traveled_distance_pixel: 740,
    elapsed_time: 3.229,
    straightness: 0.307046,
    direction_of_movement: 5.0,
    acceleration: 1000,
    jerk: 11000,
  },
  {
    cluster: 4,
    traveled_distance_pixel: 2100,
    elapsed_time: 1.716,
    straightness: 0.62,
    direction_of_movement: 4.0,
    acceleration: 950000,
    jerk: 94000000,
  },
  {
    cluster: 5,
    traveled_distance_pixel: 5100,
    elapsed_time: 0.196,
    straightness: 0.05,
    direction_of_movement: 4.0,
    acceleration: 330000,
    jerk: 82000,
  },
  {
    cluster: 6,
    traveled_distance_pixel: 2600,
    elapsed_time: 5.95,
    straightness: 0.28,
    direction_of_movement: 3.0,
    acceleration: 390000,
    jerk: 38000000,
  },
  {
    cluster: 7,
    traveled_distance_pixel: 930,
    elapsed_time: 1.513,
    straightness: 0.68,
    direction_of_movement: 4.0,
    acceleration: 90000,
    jerk: 9000000,
  },
  {
    cluster: 8,
    traveled_distance_pixel: 310,
    elapsed_time: 1.201,
    straightness: 0.89,
    direction_of_movement: 4.0,
    acceleration: 500,
    jerk: 3000,
  },
  {
    cluster: 9,
    traveled_distance_pixel: 630,
    elapsed_time: 2.996,
    straightness: 0.33,
    direction_of_movement: 1.0,
    acceleration: 800,
    jerk: 9000,
  },
]; 


// Mouse event listeners
window.addEventListener("mousemove", (e) => {
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

    mouseData.push({
      traveledDistance,
      deltaTime,
      direction,
      x,
      y,
      acceleration,
      jerk,
    });

    prevVelocity = velocity;
    prevAcceleration = acceleration;

    if (mouseData.length > 80) {
      detectUserOrBot();
    }
  }

  prevTime = currentTime;
  prevX = x;
  prevY = y;
});

// Touch event listeners
window.addEventListener("touchstart", (e) => {
  if (detectionDone) return;

  prevTouchTime = performance.now();
  prevTouchX = e.touches[0].clientX;
  prevTouchY = e.touches[0].clientY;
});

window.addEventListener("touchmove", (e) => {
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

    touchData.push({
      traveledDistance,
      deltaTime,
      direction,
      x,
      y,
      acceleration,
      jerk,
    });

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

window.addEventListener("touchend", () => {
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

  return {
    traveled_distance_pixel: sumDistance,
    elapsed_time: totalTime,
    straightness: avgStraightness,
    direction_of_movement: avgDirection,
    acceleration: avgAcceleration,
    jerk: avgJerk,
  };
}

function calculateStraightness(data) {
  if (data.length === 0) return 0;

  let startX = data[0].x;
  let startY = data[0].y;
  let endX = data[data.length - 1].x;
  let endY = data[data.length - 1].y;

  let straightLineDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  let totalDistance = data.reduce((acc, val) => acc + val.traveledDistance, 0);

  return totalDistance !== 0 ? straightLineDistance / totalDistance : 0;
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

const DISTANCE_THRESHOLD = 1000000;  // Increased to accommodate larger movements
const ANOMALY_THRESHOLD = 1.0; 
const STRAIGHTNESS_THRESHOLD = 0.2;
const STRAIGHTNESS_PENALTY = 0.7;
                                                                              
function calculateAnomalyScore(realTimeFeatures) {
  let distances = centroids.map((centroid) => calculateEuclideanDistance(realTimeFeatures, centroid));
  let minDistance = Math.min(...distances);

  let anomalyProbability = minDistance / DISTANCE_THRESHOLD;

  // Dynamic adjustment for straightness
  if (realTimeFeatures.straightness > STRAIGHTNESS_THRESHOLD) {
    anomalyProbability += STRAIGHTNESS_PENALTY;
  }

  anomalyProbability = Math.min(anomalyProbability, 1);

  return { anomalyProbability, minDistance };
}

function detectUserOrBot() {
  const checkbox = document.getElementById("verified");
  const statusLabel = document.getElementById("verification-status");
  const submitButton = document.getElementById("submit-btn");

  let realTimeFeatures = calculateRealTimeFeatures(mouseData.length > 0 ? mouseData : touchData);
  let { anomalyProbability, minDistance } = calculateAnomalyScore(realTimeFeatures);

  if (anomalyProbability >= ANOMALY_THRESHOLD || minDistance >= DISTANCE_THRESHOLD) {
    checkbox.checked = true;
    statusLabel.textContent = "Verified User";
    statusLabel.style.color = "green";
    submitButton.disabled = false;
    detectionDone = true;
  } else {
    showSlider(); // Show slider for further verification
    statusLabel.textContent = "Bot Detected";
    statusLabel.style.color = "red";
    submitButton.disabled = true;
    detectionDone = true;
  }
}

function showSlider() {
  document.getElementById("slider-container").style.display = "block";
}

function handleSliderConfirmation() {
  const slider = document.getElementById("slider");
  const confirmButton = document.getElementById("confirm-btn");
  const submitButton = document.getElementById("submit-btn");

  confirmButton.addEventListener("click", () => {
    if (parseInt(slider.value, 10) == 100) { // Adjust the threshold as needed
      // If slider value is above threshold, consider user verified
      document.getElementById("verified").checked = true;
      document.getElementById("verification-status").textContent = "Verified User";
      document.getElementById("verification-status").style.color = "green";
      submitButton.disabled = false;
    } else {
      // If slider value is below threshold, keep the bot detection
      document.getElementById("verification-status").textContent = "Bot Detected";
      document.getElementById("verification-status").style.color = "red";
      submitButton.disabled = true;
    }
    // Hide slider after confirmation
    document.getElementById("slider-container").style.display = "none";
  });
}

// Initialize slider handler
handleSliderConfirmation();
