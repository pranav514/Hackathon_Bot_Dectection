import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import seaborn as sns

# Load the training dataset
training_data = pd.read_csv('your_training_dataset.csv')

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

# Determine the optimal number of clusters using the elbow method
inertia = []
K = range(1, 10)
for k in K:
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(scaled_training_data)
    inertia.append(kmeans.inertia_)

# Plot the elbow curve to identify the optimal number of clusters
plt.figure(figsize=(8, 4))
plt.plot(K, inertia, 'bo-')
plt.xlabel('Number of Clusters (K)')
plt.ylabel('Inertia')
plt.title('Elbow Method for Optimal K')
plt.show()

# Based on the elbow plot, choose the optimal K
optimal_k = 3  # Adjust this based on the elbow curve
kmeans = KMeans(n_clusters=optimal_k, random_state=42)
training_data['cluster'] = kmeans.fit_predict(scaled_training_data)

# Load the testing dataset
testing_data = pd.read_csv('balabit_features_test.csv')

# Ensure all the required columns are present in the testing dataset
testing_data_selected = testing_data[columns_to_include]

# Standardize the selected features in the testing dataset using the same scaler
scaled_testing_data = scaler.transform(testing_data_selected)

# Predict the cluster for each test data point
testing_data['predicted_cluster'] = kmeans.predict(scaled_testing_data)

# Define a function to determine if a test data point matches any training cluster
def detect_bot(row, kmeans):
    # Calculate the distance to each cluster center
    distances = kmeans.transform([row])[0]
    # If the minimum distance is greater than a threshold, classify as a bot
    threshold = 0.1  # Adjust this threshold based on your use case
    return 1 if distances.min() > threshold else 0

# Apply the bot detection logic to each row in the testing dataset
testing_data['is_bot'] = testing_data_selected.apply(detect_bot, axis=1, kmeans=kmeans)

# Save the testing results to a new CSV file
testing_data.to_csv('tested_data_with_bot_detection.csv', index=False)

# Optionally, evaluate the performance if you have labeled data
# Assuming 'true_labels' is your ground truth for bots in the testing dataset
# true_labels = testing_data['your_ground_truth_column']
# accuracy = accuracy_score(true_labels, testing_data['is_bot'])
# conf_matrix = confusion_matrix(true_labels, testing_data['is_bot'])

# print(f"Accuracy: {accuracy}")
# print("Confusion Matrix:")
# print(conf_matrix)
