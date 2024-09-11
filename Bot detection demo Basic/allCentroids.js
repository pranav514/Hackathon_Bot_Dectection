// centroids of the testing data from the coloumn traveled_distance_pixel,elapsed_time ,etc (median)
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
// centroids of the testing data from the coloumn traveled_distance_pixel,elapsed_time ,etc (median) where k == 2
const centroids = [
    { cluster: 0, traveled_distance_pixel: 2142.635463, elapsed_time: 2.160500, straightness: 0.339504, direction_of_movement: 3.00, acceleration: 414325.409950, jerk: 35897791.085000 },
    { cluster: 1, traveled_distance_pixel: 387.835308, elapsed_time: 1.545000, straightness: 0.742838, direction_of_movement: 4.00, acceleration: 761.187242, jerk: 6211.948858 }
];


// centroids of the traning where training data is used for the clustering and k = 10 (median)
const centroids = [
    { cluster: 0, traveled_distance_pixel: 2757.831864, elapsed_time: 14.960, straightness: 0.149552, direction_of_movement: 4.00, acceleration: 2221.657300, jerk: 132237.463172 },
    { cluster: 1, traveled_distance_pixel: 249.196954, elapsed_time: 1.107, straightness: 0.909675, direction_of_movement: 7.00, acceleration: 665.800251, jerk: 3786.425741 },
    { cluster: 2, traveled_distance_pixel: 224.008118, elapsed_time: 1.139, straightness: 0.908532, direction_of_movement: 1.00, acceleration: 593.091908, jerk: 3175.268548 },
    { cluster: 3, traveled_distance_pixel: 739.260796, elapsed_time: 3.229, straightness: 0.307046, direction_of_movement: 5.00, acceleration: 945.449569, jerk: 11213.965416 },
    { cluster: 4, traveled_distance_pixel: 2075.196621, elapsed_time: 1.716, straightness: 0.621955, direction_of_movement: 4.00, acceleration: 955441.616671, jerk: 94258561.885890 },
    { cluster: 5, traveled_distance_pixel: 5145.405089, elapsed_time: 9.196, straightness: 0.054372, direction_of_movement: 4.00, acceleration: 327621.402652, jerk: 81827.185556 },
    { cluster: 6, traveled_distance_pixel: 2620.900785, elapsed_time: 5.9515, straightness: 0.285307, direction_of_movement: 3.00, acceleration: 392157.239512, jerk: 38237851.397451 },
    { cluster: 7, traveled_distance_pixel: 927.264586, elapsed_time: 1.513, straightness: 0.683015, direction_of_movement: 4.00, acceleration: 89592.054746, jerk: 8998660.156081 },
    { cluster: 8, traveled_distance_pixel: 308.150131, elapsed_time: 1.201, straightness: 0.892458, direction_of_movement: 4.00, acceleration: 509.943077, jerk: 2968.520786 },
    { cluster: 9, traveled_distance_pixel: 635.195400, elapsed_time: 2.996, straightness: 0.329099, direction_of_movement: 1.00, acceleration: 819.367317, jerk: 8951.972479 }
];


// centroids of the trainning data from the mean_v,min_v coloumns
const centroids = [
    { cluster: 0, mean_v: 321.367001, sd_v: 418.986082, mean_vx: -167.291828, sd_vx: 390.728667, mean_vy: -4.675093, sd_vy: 181.634983, mean_a: 670.187895, sd_a: 8045.576728, mean_jerk: 5121.231853, sd_jerk: 180335.233257, direction_of_movement: 4.00 },
    { cluster: 1, mean_v: 16916.566218, sd_v: 43111.448321, mean_vx: -8378.254614, sd_vx: 21990.699356, mean_vy: 11062.340954, sd_vy: 34146.790795, mean_a: 1743628.653979, sd_a: 4693730.066587, mean_jerk: 154367438.162031, sd_jerk: 472911554.467431, direction_of_movement: 2.00 },
    { cluster: 2, mean_v: 8560.833266, sd_v: 32540.630487, mean_vx: -1528.048488, sd_vx: 31087.370599, mean_vy: -219.051781, sd_vy: 17933.264805, mean_a: 2809.429752, sd_a: 3841289.255531, mean_jerk: -35491646.501174, sd_jerk: 520418421.967148, direction_of_movement: 4.00 },
    { cluster: 3, mean_v: 4109.403830, sd_v: 14353.680100, mean_vx: -724.963975, sd_vx: 8859.975871, mean_vy: 925.793067, sd_vy: 10500.854690, mean_a: 216008.445235, sd_a: 1172515.836223, mean_jerk: 12126728.675636, sd_jerk: 115019770.563490, direction_of_movement: 3.00 },
    { cluster: 4, mean_v: 9427.576439, sd_v: 30722.270463, mean_vx: 157.666947, sd_vx: 16985.809042, mean_vy: -301.465438, sd_vy: 27321.869910, mean_a: 418098.714524, sd_a: 2308155.265568, mean_jerk: 136141.386110, sd_jerk: 325740074.688994, direction_of_movement: 4.00 },
    { cluster: 5, mean_v: 9371.425337, sd_v: 34437.701416, mean_vx: -3358.468927, sd_vx: 34653.969989, mean_vy: -366.447084, sd_vy: 1184.478470, mean_a: 525695.301571, sd_a: 2848791.874287, mean_jerk: 12995408.630672, sd_jerk: 362219448.276486, direction_of_movement: 4.00 },
    { cluster: 6, mean_v: 270.614574, sd_v: 338.214311, mean_vx: 34.321623, sd_vx: 226.556517, mean_vy: 80.622296, sd_vy: 231.772040, mean_a: 680.778294, sd_a: 7237.215294, mean_jerk: 5014.846014, sd_jerk: 182002.708937, direction_of_movement: 1.00 },
    { cluster: 7, mean_v: 1414.639784, sd_v: 2714.383436, mean_vx: -17.549645, sd_vx: 2230.810665, mean_vy: -47.204935, sd_vy: 1523.630336, mean_a: 75344.272089, sd_a: 247038.585971, mean_jerk: 7573773.219896, sd_jerk: 24684116.655238, direction_of_movement: 4.00 },
    { cluster: 8, mean_v: 313.687429, sd_v: 401.474455, mean_vx: 32.896863, sd_vx: 282.203784, mean_vy: -87.286705, sd_vy: 248.411542, mean_a: 723.253038, sd_a: 7900.289402, mean_jerk: 5548.746253, sd_jerk: 187363.566334, direction_of_movement: 6.00 },
    { cluster: 9, mean_v: 5449.248838, sd_v: 23320.931477, mean_vx: -2310.253995, sd_vx: 11956.360241, mean_vy: 3951.164458, sd_vy: 20346.443380, mean_a: 483783.696924, sd_a: 2418608.809694, mean_jerk: 48261411.898870, sd_jerk: 244572899.612667, direction_of_movement: 3.00 }
];