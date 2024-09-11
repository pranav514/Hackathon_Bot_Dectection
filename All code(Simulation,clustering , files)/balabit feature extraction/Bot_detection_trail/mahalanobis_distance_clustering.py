# Step 0: Import the Required Libraries
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from scipy.spatial.distance import mahalanobis
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO)
# Step 2: Determine the Optimal Number of Clusters
def determine_optimal_clusters(scaled_data):
    inertia = []
    silhouette_scores = []
    K = range(2, 11)  # Start from 2 clusters
    for k in K:
        kmeans = KMeans(n_clusters=k, random_state=42)
        kmeans.fit(scaled_data)
        inertia.append(kmeans.inertia_)
        silhouette_scores.append(silhouette_score(scaled_data, kmeans.labels_))
    
    # Plot the elbow and silhouette score
    fig, ax1 = plt.subplots(figsize=(10, 5))
    
    ax1.plot(K, inertia, 'bo-', label='Inertia (Elbow)', color='blue')
    ax1.set_xlabel('Number of Clusters (K)')
    ax1.set_ylabel('Inertia', color='blue')
    
    ax2 = ax1.twinx()
    ax2.plot(K, silhouette_scores, 'ro-', label='Silhouette Score', color='red')
    ax2.set_ylabel('Silhouette Score', color='red')
    
    plt.title('Elbow Method and Silhouette Score for Optimal K')
    plt.show()
    
    # Choose optimal K based on silhouette score or elbow method
    optimal_k = K[np.argmax(silhouette_scores)]
    logging.info(f"Optimal number of clusters: {optimal_k}")
    return optimal_k

# Determine the optimal number of clusters
optimal_k = determine_optimal_clusters(scaled_data)

# Step 3: Fit KMeans Model
def fit_kmeans_model(scaled_data, optimal_k):
    kmeans = KMeans(n_clusters=optimal_k, random_state=42)
    kmeans.fit(scaled_data)
    return kmeans

# Fit the KMeans model
kmeans = fit_kmeans_model(scaled_data, optimal_k)

# Step 4: Visualize Clusters (2D and 3D)
def visualize_clusters(data, scaled_data, kmeans):
    data['cluster'] = kmeans.labels_
    
    # 2D Visualization
    sns.scatterplot(x=scaled_data[:, 0], y=scaled_data[:, 1], hue=data['cluster'], palette='viridis')
    plt.title('2D Cluster Visualization')
    plt.xlabel('Standardized Mean Velocity')
    plt.ylabel('Standardized Velocity SD')
    plt.show()

    # 3D Visualization (optional)
    from mpl_toolkits.mplot3d import Axes3D
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    ax.scatter(scaled_data[:, 0], scaled_data[:, 1], scaled_data[:, 2], c=data['cluster'], cmap='viridis')
    ax.set_title('3D Cluster Visualization')
    ax.set_xlabel('Mean Velocity')
    ax.set_ylabel('Velocity SD')
    ax.set_zlabel('Acceleration SD')
    plt.show()

# Visualize the clusters
visualize_clusters(data, scaled_data, kmeans)

# Step 5: Calculate Mahalanobis Distance for New Data Point
def calculate_mahalanobis_distance(kmeans, new_scaled_data_point):
    # Predict the cluster for the new data point
    cluster_center = kmeans.cluster_centers_[kmeans.predict(new_scaled_data_point.reshape(1, -1))[0]]
    distance = np.linalg.norm(new_scaled_data_point - cluster_center)
    return distance


def classify_new_data(scaler, kmeans, new_data_point, threshold):
    new_data_df = pd.DataFrame([new_data_point])
    new_scaled_data = scaler.transform(new_data_df[columns_to_include])
    
    # Calculate the distance to the centroid of the closest cluster
    distance = calculate_mahalanobis_distance(kmeans, new_scaled_data[0])
    
    is_bot = distance > threshold
    return is_bot, distance

bot_data_point_1 = {
    'mean_v': 2.0,  # Very fast average velocity
    'sd_v': 0.05,   # Low variability in velocity
    'max_v': 2.5,   # High maximum velocity
    'min_v': 1.8,   # High minimum velocity
    'mean_vx': 2.0, # Fast x-axis movement
    'sd_vx': 0.02,  # Very low variation in x-axis movement
    'max_vx': 2.4,  # High max x-axis speed
    'min_vx': 1.7,  # High min x-axis speed
    'mean_vy': 0.1, # Very slow or minimal y-axis movement (straight line)
    'sd_vy': 0.01,  # Almost no variation in y-axis movement
    'max_vy': 0.12, # Low max y-axis speed
    'min_vy': 0.08, # Low min y-axis speed
    'mean_a': 0.01, # Very low average acceleration
    'sd_a': 0.005,  # Low variation in acceleration
    'max_a': 0.02,  # Low max acceleration
    'min_a': 0.005, # Low m'mean_v': 20459.91764802422, 'sd_v': 67363.95217385978, 'max_v': 223569.6987437253, 'min_v': 0.0, 'mean_vx': 110.34108280028127, 'sd_vx': 109.71152990748796, 'max_vx': 201.03134931913596, 'min_vx': -59.24363840073928, 'mean_vy': 72.18719062743865, 'sd_vy': 45.54510763635133, 'max_vy': 100.72875357322202, 'min_vy': 0.0, 'mean_a': 61.741777715633795, 'sd_a': 90.26648721083757, 'max_a': 161.84612593172574, 'min_a': 0.0, 'mean_jerk': 47.190454516094924, 'sd_jerk': 61.983809596898716, 'max_jerk': 180.3512668147491, 'min_jerk': 0.0, 'direction_of_movement': 33.182717780330215in acceleration
    'mean_jerk': 0.001,  # Almost no jerky movement
    'sd_jerk': 0.0005,   # Very smooth movement
    'max_jerk': 0.002,   # Very low jerk max
    'min_jerk': 0.0008,  # Minimal jerk
    'direction_of_movement': 0  # No significant direction change
}
threshold = 1.5  # Tune based on validation
is_bot, distance = classify_new_data(scaler, kmeans, bot_data_point_1, threshold)

# Output the result
print(f"Is the new data point a bot? {'Yes' if is_bot else 'No'} (Distance: {distance})")



normal_user_data_point = {
    'mean_v': 634.152499,  # Average velocity is moderate
    'sd_v': 1061.6933,    # Moderate variability in velocity
    'max_v': 5162.3637,   # Maximum velocity is moderate
    'min_v': 2.3889,   # Minimum velocity is relatively low
    'mean_vx': -133.4056, # Average x-axis movement is moderate
    'sd_vx': 907.0929,   # Variability in x-axis movement is moderate
    'max_vx': 3300.0,  # Maximum x-axis speed is moderate
    'min_vx': -5100.0,  # Minimum x-axis speed is relatively low
    'mean_vy': -31.9546, # Average y-axis movement is moderate
    'sd_vy': 834.9679,   # Variability in y-axis movement is moderate
    'max_vy': 1900.0,  # Maximum y-axis speed is moderate
    'min_vy': -4900.0,  # Minimum y-axis speed is relatively low
    'mean_a': 26692.5428, # Moderate average acceleration
    'sd_a': 87552.8379,   # Moderate variation in acceleration
    'max_a': 435648.1302,   # Maximum acceleration is moderate
    'min_a': -39709.2721,  # Minimum acceleration is relatively low
    'mean_jerk': 2782076.0583,  # Slightly noticeable jerkiness
    'sd_jerk': 9098248.5988,    # Moderate variation in jerk
    'max_jerk': 43107871.5131,   # Maximum jerk is moderate
    'min_jerk': -4296965.0754,   # Minimum jerk is relatively low
    'direction_of_movement': 45  # Typical human direction changes
}

threshold = 1.5  # Tune based on validation
is_bot, distance = classify_new_data(scaler, kmeans, normal_user_data_point, threshold)

# Output the result
print(f"Is the new data point a bot? {'Yes' if is_bot else 'No'} (Distance: {distance})")

