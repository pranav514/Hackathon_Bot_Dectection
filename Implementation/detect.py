import pandas as pd
import numpy as np
import math
import random
import pyautogui
import time

# Disable the fail-safe mechanism (use with caution)
pyautogui.FAILSAFE = False

# Function to simulate bot or human movements and collect data
def simulate_movements(duration=10, bot=True):
    start_time = time.time()
    movement_data = []
    previous_x, previous_y = pyautogui.position()
    previous_time = start_time
    prev_velocity = 0
    prev_acceleration = 0

    while time.time() - start_time < duration:
        current_time = time.time()
        delta_time = current_time - previous_time

        # Skip iteration if delta_time is too small to avoid ZeroDivisionError
        if delta_time == 0:
            continue

        if bot:
            # Bot moves strictly vertically or horizontally
            move_direction = random.choice(['vertical', 'horizontal'])

            if move_direction == 'horizontal':
                # Move horizontally in a straight line
                x = random.randint(0, pyautogui.size().width)  # Random x across the screen width
                y = previous_y  # Keep y constant for horizontal movement
            else:
                # Move vertically in a straight line
                x = previous_x  # Keep x constant for vertical movement
                y = random.randint(0, pyautogui.size().height)  # Random y across the screen height
            
            move_duration = random.uniform(0.005, 0.03)  # Short duration for quick bot-like movement
        else:
            # Human-like slower and more deliberate movements
            x = random.randint(previous_x - 100, previous_x + 100)
            y = random.randint(previous_y - 100, previous_y + 100)
            move_duration = random.uniform(0.1, 0.5)

        # Perform the movement
        pyautogui.moveTo(x, y, duration=move_duration)

        delta_x = x - previous_x
        delta_y = y - previous_y
        distance_traveled = math.sqrt(delta_x ** 2 + delta_y ** 2)

        # Calculate velocity, acceleration, and jerk
        velocity = distance_traveled / delta_time if delta_time > 0 else 0
        acceleration = (velocity - prev_velocity) / delta_time if delta_time > 0 else 0
        jerk = (acceleration - prev_acceleration) / delta_time if delta_time > 0 else 0

        direction_of_movement = math.atan2(delta_y, delta_x) * (180 / math.pi)
        straightness = abs(delta_x / distance_traveled) if distance_traveled != 0 else 0

        # Append calculated data to movement data list
        movement_data.append([distance_traveled, delta_time, straightness, direction_of_movement, acceleration, jerk])

        # Update previous values for next iteration
        previous_x = x
        previous_y = y
        previous_time = current_time
        prev_velocity = velocity
        prev_acceleration = acceleration

    return pd.DataFrame(movement_data, columns=['distance', 'time', 'straightness', 'direction', 'acceleration', 'jerk'])

# Centroid data provided
centroids = [
    { 'cluster': 0, 'traveled_distance_pixel': 641.36, 'elapsed_time': 2.99, 'straightness': 0.66, 'direction_of_movement': 3.59, 'acceleration': 0.3, 'jerk': 0.05 },
    { 'cluster': 1, 'traveled_distance_pixel': 2224.94, 'elapsed_time': 1.24, 'straightness': 0.54, 'direction_of_movement': 3.40, 'acceleration': 0.4, 'jerk': 0.06 },
    { 'cluster': 2, 'traveled_distance_pixel': 3218.14, 'elapsed_time': 3.10, 'straightness': 0.25, 'direction_of_movement': 2.21, 'acceleration': 0.5, 'jerk': 0.07 },
    { 'cluster': 3, 'traveled_distance_pixel': 4299.96, 'elapsed_time': 6.98, 'straightness': 0.20, 'direction_of_movement': 3.38, 'acceleration': 0.6, 'jerk': 0.08 },
    { 'cluster': 4, 'traveled_distance_pixel': 2632.28, 'elapsed_time': 3.35, 'straightness': 0.49, 'direction_of_movement': 4.22, 'acceleration': 0.7, 'jerk': 0.09 },
    { 'cluster': 5, 'traveled_distance_pixel': 507.53, 'elapsed_time': 2.74, 'straightness': 0.68, 'direction_of_movement': 0.87, 'acceleration': 0.3, 'jerk': 0.05 },
    { 'cluster': 6, 'traveled_distance_pixel': 1287.50, 'elapsed_time': 3.08, 'straightness': 0.60, 'direction_of_movement': 3.75, 'acceleration': 0.4, 'jerk': 0.06 },
    { 'cluster': 7, 'traveled_distance_pixel': 621.06, 'elapsed_time': 2.93, 'straightness': 0.65, 'direction_of_movement': 6.05, 'acceleration': 0.5, 'jerk': 0.07 },
    { 'cluster': 8, 'traveled_distance_pixel': 2593.14, 'elapsed_time': 3.81, 'straightness': 0.32, 'direction_of_movement': 2.27, 'acceleration': 0.6, 'jerk': 0.08 }
]

# Function to calculate Euclidean distance between real-time features and centroids
def calculate_euclidean_distance(features, centroid):
    distance = np.sqrt(
        (features['distance'] - centroid['traveled_distance_pixel']) ** 2 +
        (features['time'] - centroid['elapsed_time']) ** 2 +
        (features['straightness'] - centroid['straightness']) ** 2 +
        (features['direction'] - centroid['direction_of_movement']) ** 2 +
        (features['acceleration'] - centroid['acceleration']) ** 2 +
        (features['jerk'] - centroid['jerk']) ** 2
    )
    return distance

# Function to assign clusters based on minimum Euclidean distance
def assign_clusters(movement_data):
    cluster_assignments = []

    for index, data_point in movement_data.iterrows():
        min_distance = float('inf')
        closest_cluster = None

        for centroid in centroids:
            distance = calculate_euclidean_distance(data_point, centroid)
            if distance < min_distance:
                min_distance = distance
                closest_cluster = centroid['cluster']

        cluster_assignments.append(closest_cluster)

    movement_data['assigned_cluster'] = cluster_assignments
    return movement_data

# Function to detect if the user is a bot or not based on movement data
def detect_user_or_bot(movement_data):
    # Define bot-like clusters (update based on observed patterns)
    bot_clusters = [1, 2, 3, 4]  # Example clusters identified as bot-like based on velocity and jerk

    # Count how many data points are assigned to bot-like clusters
    bot_like_count = sum(movement_data['assigned_cluster'].isin(bot_clusters))

    # Threshold: if more than 50% of movements belong to bot-like clusters, classify as bot
    if bot_like_count / len(movement_data) > 0.5:
        return "Bot"
    else:
        return "Human"

# Simulate movements
movement_data = simulate_movements(duration=15, bot=True)  # Set bot=True for bot-like movements

# Assign clusters to each movement data point
movement_data_with_clusters = assign_clusters(movement_data)
print(movement_data_with_clusters)

# Predict if the user is a bot or human
prediction = detect_user_or_bot(movement_data_with_clusters)
print(f"Prediction: {prediction}")
