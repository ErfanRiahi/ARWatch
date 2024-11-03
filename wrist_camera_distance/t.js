// Load MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`
  });
  
  // Configure MediaPipe hands detection options
  hands.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  
  // Initialize a function to receive detection results
  hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const wrist = results.multiHandLandmarks[0][0]; // The wrist is the first landmark in the array
      console.log('Wrist coordinates:', { x: wrist.x, y: wrist.y, z: wrist.z });
    } else {
      console.log("No hands detected");
    }
  });
  
  // Function to load and process an image directly
  function loadImageAndDetect() {
    const img = new Image();
    img.src = '../assets/hand_mac.jpg'; // replace with your image data
    img.onload = async () => {
      // Send image to MediaPipe for hand detection
      await hands.send({ image: img });
    };
  }
  
  // Start the detection
  loadImageAndDetect();
  