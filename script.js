// Import statements for Three.js and add-ons
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// Global variables
let flightData = null;
let telemetryData = [];
let telemetryTimes = [];
let totalDuration = 0; // in milliseconds
let timelineWidth = 0;
let lastFrameTime = null;

let isPlaying = false;
let cursorPosition = 0;
let cursor = document.getElementById('timelineCursor');
let playPauseButton = document.getElementById('playPauseButton');
let rewindButton = document.getElementById('rewindButton');
let timestep = 5; // Adjust the speed of the cursor here (pixels per frame)

let scene, camera, renderer, rocketModel, controls;



document.addEventListener('DOMContentLoaded', function() {
    timelineWidth = document.querySelector('.ruler').offsetWidth;
    initThreeJS();
});

function initThreeJS() {
    const container = document.getElementById('rocketViewer');

    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x555555); // Optional: Change background color for better contrast

    // Create the camera
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(31, 17, 0); // Initial side position

    // Create the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadow maps
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use a softer shadow map
    container.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Reduced intensity
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Increased intensity
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true; // Enable shadow
    scene.add(directionalLight);

    // Add additional point light for better illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 8, 0); // Ensure the camera focuses on the rocket
    controls.update();

        // Disable mouse actions on camera
        controls.enableZoom = false; // Disable zooming
        controls.enableRotate = false; // Disable rotation
        controls.enablePan = false; // Disable panning
    
        // Optionally, you can also disable the event listeners for controls
        controls.dispose();

//     // Add event listener to log camera position on change
// controls.addEventListener('change', function () {
//     console.log(`Camera Position: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`);
//     console.log(`Camera Rotation: x=${THREE.MathUtils.radToDeg(camera.rotation.x).toFixed(2)}, y=${THREE.MathUtils.radToDeg(camera.rotation.y).toFixed(2)}, z=${THREE.MathUtils.radToDeg(camera.rotation.z).toFixed(2)}`);
// });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Load the rocket model
    loadRocketModel();
}





function onWindowResize() {
    const container = document.getElementById('rocketViewer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function loadRocketModel() {
    const loader = new GLTFLoader();
    loader.load(
        'assets/models/rocket.glb', // Update the path to your model
        function (gltf) {
            rocketModel = gltf.scene;
            rocketModel.scale.set(1, 1, 1); // Adjust scale if necessary
            rocketModel.rotation.set(0, 0, 0); // Set rotation to make the rocket point upwards
            scene.add(rocketModel);

            // Start rendering after the model is loaded
            animate();
        },
        undefined,
        function (error) {
            console.error('An error occurred while loading the model:', error);
        }
    );
}


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// function updateRocketOrientation(orientation) {
//     if (rocketModel) {
//         let roll = orientation[0];
//         let pitch = orientation[1];
//         let yaw = orientation[2];

//         roll = degreesToRadians(roll);
//         pitch = degreesToRadians(pitch);
//         yaw = degreesToRadians(yaw);

//         // Adjust rotation order if necessary
//         rocketModel.rotation.set(pitch, yaw, roll, 'ZYX');
//     }
// }


// Make sure this is outside any other function or block
window.updateRocketOrientation = function(orientation) {
    if (rocketModel) {
        let roll = orientation[0];
        let pitch = orientation[1];
        let yaw = orientation[2];

        roll = THREE.MathUtils.degToRad(roll); // Convert degrees to radians
        pitch = THREE.MathUtils.degToRad(pitch);
        yaw = THREE.MathUtils.degToRad(yaw);

        // Adjust rotation order if necessary
        rocketModel.rotation.set(pitch, yaw, roll, 'ZYX');
    } else {
        console.warn('Rocket model is not loaded yet.');
    }
};


$(document).ready(function() {
    var dropzone = $('.uploadDropzone');
    var progressBox = $('#progressContainer');
    var msgBox = $('.uploadMessage');

    // Function to handle file reading and processing
    function handleFiles(files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();

            reader.onload = (function(file) {
                return function(e) {
                    var fileContent = e.target.result;

                    try {
                        var jsonData = JSON.parse(fileContent);
                        console.log('Parsed JSON:', jsonData);

                        // Store the parsed data
                        flightData = jsonData;

                        // Update the UI with flight card data
                        updateFlightCard(jsonData.flight_card);

                        // Store the telemetry data and process times
                        telemetryData = jsonData.telemetry;
                        processTelemetryData();

                        // Update UI with the file name
                        //updateUIAfterUpload(file.name);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                        //showUploadMessage('Invalid AST file.', 'error');
                    }
                };
            })(file);

            reader.readAsText(file); // Read as text to get JSON content
        }
    }

    // Rest of your existing code for handling uploads...

    // Handle button click for file selection
    function bindUploadButton() {
        $('.btnUpload').on('click', function() {
            var fileInput = $('<input type="file" accept=".ast">').on('change', function(event) {
                var files = event.target.files;
                handleFiles(files);
            });
            fileInput.click();
        });
    }

    // Bind the button initially
    bindUploadButton();

    // Handle drag-and-drop
    dropzone.on('dragenter dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('hover');
    });

    dropzone.on('dragleave dragend drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('hover');
    });

    dropzone.on('drop', function(e) {
        var files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });
});

// Update the flight card with data from the AST file
function updateFlightCard(flightCard) {
    var flightCardElement = document.querySelector('.flight-card');

    // Clear existing content
    flightCardElement.innerHTML = '';

    // Create and append new elements with the flight card data
    var rocketName = document.createElement('p');
    rocketName.className = 'flight-card-text';
    rocketName.textContent = 'Rocket: ' + flightCard.rocket_name;
    flightCardElement.appendChild(rocketName);

    var motorUsed = document.createElement('p');
    motorUsed.className = 'flight-card-text';
    motorUsed.textContent = 'Motor: ' + flightCard.motor_used;
    flightCardElement.appendChild(motorUsed);

    var flyer = document.createElement('p');
    flyer.className = 'flight-card-text';
    flyer.textContent = 'Flyer: ' + flightCard.flyer;
    flightCardElement.appendChild(flyer);

    var flightDate = document.createElement('p');
    flightDate.className = 'flight-card-text';
    flightDate.textContent = 'Flight Date: ' + flightCard.flight_date;
    flightCardElement.appendChild(flightDate);

    var location = document.createElement('p');
    location.className = 'flight-card-text';
    location.textContent = 'Location: ' + flightCard.location;
    flightCardElement.appendChild(location);

    var flightComputer = document.createElement('p');
    flightComputer.className = 'flight-card-text';
    flightComputer.textContent = 'Flight Computer: ' + flightCard.flight_computer;
    flightCardElement.appendChild(flightComputer);
}

// Process telemetry data to extract times and total duration
function processTelemetryData() {
    telemetryTimes = [];
    telemetryData.forEach(function(dataPoint) {
        let timestamp = dataPoint.timestamp; // e.g., "00:050"
        let parts = timestamp.split(':');
        let seconds = parseInt(parts[0]);
        let milliseconds = parseInt(parts[1]);
        let totalMilliseconds = seconds * 1000 + milliseconds;
        telemetryTimes.push(totalMilliseconds);
    });
    // Get total duration
    totalDuration = telemetryTimes[telemetryTimes.length - 1];

    // Set timeline width (after data is loaded)
    timelineWidth = document.querySelector('.ruler').offsetWidth;

    // Generate time labels
    generateTimeLabels();
}


// Get telemetry data at a given current time
function getTelemetryDataAtTime(currentTime) {
    // currentTime is in milliseconds
    // telemetryTimes is an array of times in milliseconds
    // telemetryData is an array of data points

    for (let i = 0; i < telemetryTimes.length; i++) {
        if (telemetryTimes[i] >= currentTime) {
            return telemetryData[i];
        }
    }
    // If currentTime exceeds the last timestamp, return the last data point
    return telemetryData[telemetryData.length - 1];
}

// Update the current data area with telemetry data
function updateCurrentData(dataPoint) {
    var currentDataElement = document.querySelector('.current-data');

    currentDataElement.innerHTML = '';

    var header = document.createElement('h3');
    header.textContent = 'Current Data';
    currentDataElement.appendChild(header);

    var timestampP = document.createElement('p');
    timestampP.textContent = 'Timestamp: ' + dataPoint.timestamp;
    currentDataElement.appendChild(timestampP);

    // Get roll, pitch, yaw from bno055_data.orientation
    var roll = dataPoint.bno055_data.orientation[0];
    var pitch = dataPoint.bno055_data.orientation[1];
    var yaw = dataPoint.bno055_data.orientation[2];
    var rpyP = document.createElement('p');
    rpyP.textContent = 'Roll: ' + roll.toFixed(2) + '° | Pitch: ' + pitch.toFixed(2) + '° | Yaw: ' + yaw.toFixed(2) + '°';
    currentDataElement.appendChild(rpyP);

    // Altitude from GPS data
    var altitude = dataPoint.gps_data.altitude;
    var altitudeP = document.createElement('p');
    altitudeP.textContent = 'Altitude (GPS): ' + altitude.toFixed(2) + ' m';
    currentDataElement.appendChild(altitudeP);

    // Velocity from GPS data (calculate magnitude)
    var velocityComponents = dataPoint.gps_data.velocity;
    var velocityMagnitude = Math.sqrt(velocityComponents[0] ** 2 + velocityComponents[1] ** 2 + velocityComponents[2] ** 2);
    var velocityP = document.createElement('p');
    velocityP.textContent = 'Velocity (GPS): ' + velocityMagnitude.toFixed(2) + ' m/s';
    currentDataElement.appendChild(velocityP);

    // Acceleration from bno055_data.acceleration
    var accelerationComponents = dataPoint.bno055_data.acceleration;
    var accelerationMagnitude = Math.sqrt(accelerationComponents[0] ** 2 + accelerationComponents[1] ** 2 + accelerationComponents[2] ** 2);
    // Convert m/s^2 to G (1 G = 9.81 m/s^2)
    var accelerationG = accelerationMagnitude / 9.81;
    var accelerationP = document.createElement('p');
    accelerationP.textContent = 'Acceleration: ' + accelerationG.toFixed(2) + ' G';
    currentDataElement.appendChild(accelerationP);

    // Flight Events
    var events = dataPoint.events;
    var activeEvents = [];
    for (var event in events) {
        if (events[event]) {
            let displayEvent = event.replace('_', ' ').toUpperCase();
            activeEvents.push(displayEvent);
        }
    }
    var eventsP = document.createElement('p');
    eventsP.textContent = 'Flight Events: ' + (activeEvents.length > 0 ? activeEvents.join(', ') : 'None');
    currentDataElement.appendChild(eventsP);


        // Update Rocket Orientation
        updateRocketOrientation(dataPoint.bno055_data.orientation);
}


$(document).on('click', '.deleteAttachment', function(e) {
    e.preventDefault();
    var wrapper = $(this).closest('.wrapper');
    wrapper.remove();

    // ... Back-end-dev should add a function to actually delete the image from the server.
});

playPauseButton.addEventListener('click', function() {
    if (isPlaying) {
        pauseTimeline();
    } else {
        playTimeline();
    }
});

rewindButton.addEventListener('click', function() {
    rewindTimeline();
});

window.addEventListener('resize', function() {
    timelineWidth = document.querySelector('.ruler').offsetWidth;
    generateTimeLabels(); // Regenerate time labels on resize
});

function playTimeline() {
    if (!telemetryData || telemetryData.length === 0) {
        alert('No telemetry data loaded. Please upload an AST file.');
        return;
    }
    isPlaying = true;
    let icon = playPauseButton.querySelector('i');
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');

    lastFrameTime = null; // Reset last frame time
    requestAnimationFrame(animateCursor);
}

function pauseTimeline() {
    isPlaying = false;
    let icon = playPauseButton.querySelector('i');
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
}

function rewindTimeline() {
    pauseTimeline();
    cursorPosition = 0;
    cursor.style.left = cursorPosition + 'px';

    // Update current data to the first data point
    if (telemetryData && telemetryData.length > 0) {
        updateCurrentData(telemetryData[0]);
    }
}

function animateCursor(timestamp) {
    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (isPlaying && cursorPosition <= timelineWidth) {
        // Update current time based on cursor position
        let currentTime = (cursorPosition / timelineWidth) * totalDuration;

        // Get the telemetry data at the current time
        let currentDataPoint = getTelemetryDataAtTime(currentTime);

        // Update the current data area
        updateCurrentData(currentDataPoint);

        // Increment cursor position based on deltaTime
        cursorPosition += (deltaTime / totalDuration) * timelineWidth;
        cursor.style.left = cursorPosition + 'px';

        requestAnimationFrame(animateCursor);
    } else {
        pauseTimeline();
    }
}


function generateTimeLabels() {
    const timeLabelsContainer = document.getElementById('timeLabels');
    timeLabelsContainer.innerHTML = '';

    const totalSeconds = Math.ceil(totalDuration / 1000); // Total duration in seconds
    const timelineWidth = document.querySelector('.ruler').offsetWidth;

    for (let i = 0; i <= totalSeconds; i++) {
        const labelPosition = (i / totalSeconds) * timelineWidth;

        const labelElement = document.createElement('div');
        labelElement.className = 'time-label';
        labelElement.style.left = `${(i / totalSeconds) * 100}%`;

        // Format time to MM:SS
        const minutes = Math.floor(i / 60);
        const seconds = i % 60;

        labelElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        timeLabelsContainer.appendChild(labelElement);
    }
}