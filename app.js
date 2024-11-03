const Pose = window.Hands
const Camera = window.Camera

const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const PWrist = document.querySelector('.wrist_width')
let firstImage = true
let reference_wrist_width = 0
let focal_length = 0


// Set up MediaPipe Pose
const hands = new Hands({
locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`;
}
});

hands.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Function to load and process an image directly
function loadImageAndDetect() {
    const img = new Image();
    img.src = 'assets/hand_mac.jpg'; // replace with your image data
    img.onload = async () => {
        // Send image to MediaPipe for hand detection
        await hands.send({ image: img });
    };
}

// Start the detection
loadImageAndDetect();


// Define the onResults callback
function onResults(results) {
// Clear the canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the video frame to the canvas
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Map pose landmarks to 3D coordinates
    if (results.multiHandLandmarks) {
        // const leftShoulder = results.poseLandmarks[11];
        // const rightShoulder = results.poseLandmarks[12];

        // const bodyWidth = (leftShoulder.x - rightShoulder.x) * canvasElement.width;
        // const bodyHeight = (results.poseLandmarks[24].y - results.poseLandmarks[12].y) * canvasElement.height;

        // // Calculate the rotation of body
        // const m = (leftShoulder.z - rightShoulder.z) / (leftShoulder.x - rightShoulder.x);
        // body_rotation = Math.atan(m) * 180 / Math.PI

        // // model.rotation.y = body_rotation / 100
        
        // // Adjust the 3D model position based on the pose detection
        // if (model) {
        // const shirtX = (leftShoulder.x + rightShoulder.x) ; // Convert from 0-1 range to -1 to 1 for Three.js
        // const shirtY = -((leftShoulder.y + results.poseLandmarks[24].y) * 3); // Invert Y-axis for Three.js
        // model.position.set(0, 0, 0); // Adjust Z as needed
        // model.scale.set(bodyWidth / 1.2, bodyHeight / 1.2, 150); // Adjust model size
        // }
        let actual_wrist_width = 5
        let reference_distance = 32

        if (firstImage) {
            firstImage = false

            console.log(results.multiHandLandmarks[0][0])
            const wrist = results.multiHandLandmarks[0][0]
            const wristX = wrist.x * canvasElement.width
            const wristY = wrist.y * canvasElement.height

            // Index Finger MCP
            const IFM = results.multiHandLandmarks[0][5]
            const IFMX = IFM.x * canvasElement.width
            const IFMY = IFM.y * canvasElement.height

            reference_wrist_width = Math.sqrt(Math.pow(wristY - IFMY, 2) + Math.pow(wristX - IFMX, 2))

            // PWrist.innerHTML = `Wrist width = ${cameraWristDistance}`
            focal_length = (reference_wrist_width * reference_distance) / actual_wrist_width
        }


        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
            // const [wristX, wristY, _] = landmarks[0]
            const wristX = landmarks[0].x * canvasElement.width
            const wristY = landmarks[0].y * canvasElement.height

            // Index Finger MCP
            const IFMX = landmarks[5].x * canvasElement.width
            const IFMY = landmarks[5].y * canvasElement.height

            const reference_wrist_width = Math.sqrt(Math.pow(wristY - IFMY, 2) + Math.pow(wristX - IFMX, 2))

            const cameraWristDistanceCM = (focal_length * actual_wrist_width) / reference_wrist_width

            PWrist.innerHTML = `Wrist width = ${cameraWristDistanceCM}`
        }
        // Draw the pose landmarks
        // drawConnectors(canvasCtx, results.handsLandmarks, HANDS_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        // drawLandmarks(canvasCtx, results.handsLandmarks, { color: '#FF0000', lineWidth: 2 });
    }
}

// Initialize the webcam feed using the Camera Utils library
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
    });
camera.start();