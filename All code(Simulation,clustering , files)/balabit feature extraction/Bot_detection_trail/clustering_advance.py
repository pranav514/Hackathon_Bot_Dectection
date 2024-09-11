import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from scipy.spatial.distance import mahalanobis

# Load the training dataset
training_data = pd.read_csv('balabit_features_training')

# Select columns related to velocity, x-velocity, y-velocity, acceleration, jerk, and theta
columns_to_include = [
    'mean_v', 'sd_v', 'max_v', 'min_v',
    'mean_vx', 'sd_vx', 'max_vx', 'min_vx',
    'mean_vy', 'sd_vy', 'max_vy', 'min_vy',
    'mean_a', 'sd_a', 'max_a', 'min_a',
    'mean_jerk', 'sd_jerk', 'max_jerk', 'min_jerk',
    'direction_of_movement'
]

# Ensure all the required columns are present in the training dataset
training_data_selected = training_data[columns_to_include]

# Standardize the selected features in the training dataset
scaler = StandardScaler()
scaled_training_data = scaler.fit_transform(training_data_selected)

# Apply PCA for dimensionality reduction
pca = PCA(n_components=0.95)  # Retain 95% of variance
reduced_training_data = pca.fit_transform(scaled_training_data)

# Determine the optimal number of clusters using the silhouette score
silhouette_scores = []
K = range(2, 11)
for k in K:
    kmeans = KMeans(n_clusters=k, random_state=42)
    cluster_labels = kmeans.fit_predict(reduced_training_data)
    silhouette_avg = silhouette_score(reduced_training_data, cluster_labels)
    silhouette_scores.append(silhouette_avg)

# Plot the silhouette scores to identify the optimal number of clusters
plt.figure(figsize=(8, 4))
plt.plot(K, silhouette_scores, 'bo-')
plt.xlabel('Number of Clusters (K)')
plt.ylabel('Silhouette Score')
plt.title('Silhouette Score Method for Optimal K')
plt.show()

# Based on the silhouette plot, choose the optimal K
optimal_k = K[silhouette_scores.index(max(silhouette_scores))]
kmeans = KMeans(n_clusters=optimal_k, random_state=42)
training_data['cluster'] = kmeans.fit_predict(reduced_training_data)

# Load the testing dataset
testing_data = pd.read_csv('balabit_features_test.csv')

# Ensure all the required columns are present in the testing dataset
testing_data_selected = testing_data[columns_to_include]

# Standardize the selected features in the testing dataset using the same scaler
scaled_testing_data = scaler.transform(testing_data_selected)

# Apply the same PCA transformation to the testing data
reduced_testing_data = pca.transform(scaled_testing_data)

# Predict the cluster for each test data point
testing_data['predicted_cluster'] = kmeans.predict(reduced_testing_data)

# Define a function to determine if a test data point matches any training cluster
def detect_bot(row, kmeans, inv_cov_matrix, cluster_centers):
    # Calculate the Mahalanobis distance to each cluster center
    distances = []
    for center in cluster_centers:
        distances.append(mahalanobis(row, center, inv_cov_matrix))
    # If the minimum distance is greater than a threshold, classify as a bot
    threshold = np.percentile(distances, 95)  # Using the 95th percentile as the threshold
    return 1 if min(distances) > threshold else 0

# Compute the inverse covariance matrix of the training data
inv_cov_matrix = np.linalg.inv(np.cov(reduced_training_data, rowvar=False))

# Apply the bot detection logic to each row in the testing dataset
cluster_centers = kmeans.cluster_centers_
testing_data['is_bot'] = testing_data_selected.apply(detect_bot, axis=1, kmeans=kmeans, inv_cov_matrix=inv_cov_matrix, cluster_centers=cluster_centers)

# Save the testing results to a new CSV file
testing_data.to_csv('tested_data_with_advanced_bot_detection.csv', index=False)

# Optionally, evaluate the performance if you have labeled data
# Assuming 'true_labels' is your ground truth for bots in the testing dataset
# true_labels = testing_data['your_ground_truth_column']
# accuracy = accuracy_score(true_labels, testing_data['is_bot'])
# conf_matrix = confusion_matrix(true_labels, testing_data['is_bot'])

# print(f"Accuracy: {accuracy}")
# print("Confusion Matrix:")
# print(conf_matrix)
