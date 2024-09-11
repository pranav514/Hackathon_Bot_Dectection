import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Step 1: Load and Preprocess the Data
# Replace 'your_dataset.csv' with your actual dataset file path
data = pd.read_csv('your_dataset.csv')

# Select columns related to velocity, x-velocity, y-velocity, acceleration, jerk, and theta
columns_to_include = [
    'mean_v', 'sd_v', 'max_v', 'min_v',
    'mean_vx', 'sd_vx', 'max_vx', 'min_vx',
    'mean_vy', 'sd_vy', 'max_vy', 'min_vy',
    'mean_a', 'sd_a', 'max_a', 'min_a',
    'mean_jerk', 'sd_jerk', 'max_jerk', 'min_jerk',
    'direction_of_movement'
]

# Ensure all the required columns are present in the dataset
data_selected = data[columns_to_include]

# Standardize the selected features
scaler = StandardScaler()
scaled_data = scaler.fit_transform(data_selected)

# Step 2: Determine the Optimal Number of Clusters using the Elbow Method
inertia = []
K = range(1, 10)
for k in K:
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(scaled_data)
    inertia.append(kmeans.inertia_)

# Plot the elbow curve
plt.figure(figsize=(8, 4))
plt.plot(K, inertia, 'bo-')
plt.xlabel('Number of Clusters (K)')
plt.ylabel('Inertia')
plt.title('Elbow Method for Optimal K')
plt.show()

# Step 3: Choose an Optimal K and Fit the KMeans Model
optimal_k = 3  # This should be chosen based on the elbow curve
kmeans = KMeans(n_clusters=optimal_k, random_state=42)
data['cluster'] = kmeans.fit_predict(scaled_data)

# Visualize the Clustering (using the first two features for simplicity)
sns.scatterplot(x=scaled_data[:, 0], y=scaled_data[:, 1], hue=data['cluster'], palette='viridis')
plt.title('Cluster Visualization')
plt.xlabel('Standardized Mean Velocity')
plt.ylabel('Standardized Velocity SD')
plt.show()

# Step 4: Save the Clustered Data to a New CSV File
data.to_csv('clustered_data_with_stats.csv', index=False)

# Step 5: Bot Detection for New Data Points
# Assuming 'new_data_point' is a single new interaction to classify
# Replace 'new_data' with actual new data you want to classify

new_data_point = {
    'mean_v': 0.5, 'sd_v': 0.1, 'max_v': 0.6, 'min_v': 0.4,
    'mean_vx': 0.3, 'sd_vx': 0.05, 'max_vx': 0.4, 'min_vx': 0.2,
    'mean_vy': 0.4, 'sd_vy': 0.07, 'max_vy': 0.5, 'min_vy': 0.3,
    'mean_a': 0.2, 'sd_a': 0.02, 'max_a': 0.25, 'min_a': 0.15,
    'mean_jerk': 0.1, 'sd_jerk': 0.01, 'max_jerk': 0.12, 'min_jerk': 0.08,
    'direction_of_movement': 45
}

# Convert the new data point to a DataFrame for processing
new_data_df = pd.DataFrame([new_data_point])
new_scaled_data = scaler.transform(new_data_df[columns_to_include])

# Step 6: Assign New Data Points to Clusters and Calculate the Distance
cluster_assignment = kmeans.predict(new_scaled_data)
distance_to_centroid = np.linalg.norm(new_scaled_data - kmeans.cluster_centers_[cluster_assignment], axis=1)

# Step 7: Set a Threshold for Bot Detection
threshold = 1.5  # This should be tuned based on validation data
is_bot = distance_to_centroid > threshold

# Output the result
print(f"Is the new data point a bot? {'Yes' if is_bot else 'No'}")
