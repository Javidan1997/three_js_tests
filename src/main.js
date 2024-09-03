import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
document.body.appendChild(renderer.domElement);

const textureLoader = new TextureLoader();
const skyTexture = textureLoader.load('/sky.jpg');
scene.background = skyTexture;

// Add OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Set initial camera position to see the whole model clearly
camera.position.set(10, 10, 15); // Adjusted for better overall visibility
controls.update();

// Improved Lighting Setup
const ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Soft white light
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8); // Ambient lighting from above and below
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Adjust intensity as needed
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true; // Enable shadow casting
directionalLight.shadow.mapSize.width = 2048; // Increase shadow map size for better quality
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Add a Ground Plane Helper
// Load floor texture
const floorTexture = textureLoader.load('/floor2.jpg');

// Modify ground material to use the loaded floor texture
const groundMaterial = new THREE.MeshLambertMaterial({ map: floorTexture });
const groundGeometry = new THREE.PlaneGeometry(200, 200); // Large ground plane
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
ground.position.y = -0.1; // Adjust the ground height
ground.receiveShadow = true;

scene.add(ground);

const grassTexture = textureLoader.load('grass.jpg');

// Load bump map for added depth
const bumpMap = textureLoader.load('grass-bump.png'); // Use a bump map texture
// Create the grass plane geometry and material with bump mapping
const grassGeometry = new THREE.PlaneGeometry(50, 50, 32, 32); // Increase segments for more detail
const grassMaterial = new THREE.MeshStandardMaterial({
  map: grassTexture,
  bumpMap: bumpMap,
  bumpScale: 0.5, // Adjust bump scale for desired depth effect
  side: THREE.DoubleSide // Render both sides of the plane
});

const grass = new THREE.Mesh(grassGeometry, grassMaterial);

// Position the grass in the middle of the ground
grass.rotation.x = -Math.PI / 2; // Rotate to lay flat
grass.position.y = -0.05; // Adjust height to sit on top of the ground plane
grass.receiveShadow = true; // Make sure it receives shadows
scene.add(grass);

// Position the grass in the middle of the ground
grass.rotation.x = -Math.PI / 2; // Rotate to lay flat
grass.position.y = -0.05; // Adjust height to sit on top of the ground plane
grass.receiveShadow = true; // Make sure it receives shadows
scene.add(grass);

// Add grid helper for visual reference
// const gridHelper = new THREE.GridHelper(200, 50, 0x000000, 0x000000); // Large grid for reference
// gridHelper.position.y = -1; // Align with ground height
// scene.add(gridHelper);

// Create a box to display the name of the highlighted object
const nameDisplayBox = document.createElement('div');
nameDisplayBox.style.position = 'absolute';
nameDisplayBox.style.top = '10px';
nameDisplayBox.style.left = '10px';
nameDisplayBox.style.padding = '10px';
nameDisplayBox.style.backgroundColor = '#fff';
nameDisplayBox.style.border = '1px solid #ccc';
nameDisplayBox.style.fontSize = '14px';
document.body.appendChild(nameDisplayBox);

// Create checkboxes for controlling LED lights
const ledCheckboxes = {};
const ledContainer = document.createElement('div');
ledContainer.style.position = 'absolute';
ledContainer.style.top = '50px';
ledContainer.style.left = '10px';
ledContainer.style.padding = '10px';
ledContainer.style.backgroundColor = '#fff'; // White background for better visibility
ledContainer.style.border = '1px solid #ccc'; // Light border
document.body.appendChild(ledContainer);

const ledParts = ['3DGeom-4_3', '3DGeom-4_2', '3DGeom-4_1', '3DGeom-4'];

// Create a dropdown for resizing node groups
const groupDropdown = document.createElement('select');
groupDropdown.style.position = 'absolute';
groupDropdown.style.top = '150px';
groupDropdown.style.left = '10px';
groupDropdown.style.padding = '10px';
document.body.appendChild(groupDropdown);

// Create input fields for resizing
const resizeContainer = document.createElement('div');
resizeContainer.style.position = 'absolute';
resizeContainer.style.top = '200px';
resizeContainer.style.left = '10px';
resizeContainer.style.padding = '10px';
resizeContainer.style.backgroundColor = '#fff'; // White background for better visibility
resizeContainer.style.border = '1px solid #ccc'; // Light border
resizeContainer.style.display = 'none'; // Initially hidden
document.body.appendChild(resizeContainer);

const widthInput = document.createElement('input');
widthInput.type = 'number';
widthInput.placeholder = 'Width';
resizeContainer.appendChild(widthInput);

const heightInput = document.createElement('input');
heightInput.type = 'number';
heightInput.placeholder = 'Height';
resizeContainer.appendChild(heightInput);

const depthInput = document.createElement('input');
depthInput.type = 'number';
depthInput.placeholder = 'Depth';
resizeContainer.appendChild(depthInput);

const applyButton = document.createElement('button');
applyButton.textContent = 'Apply Resize';
resizeContainer.appendChild(applyButton);

// Create a button to start rotation animation
const rotateButton = document.createElement('button');
rotateButton.textContent = 'Rotate Parts';
rotateButton.style.position = 'absolute';
rotateButton.style.top = '250px';
rotateButton.style.left = '10px';
rotateButton.style.padding = '10px';
document.body.appendChild(rotateButton);

const groups = {};

// Variables to manage highlighting and LED lights
let originalMaterials = {};
let selectableParts = {};
let ledLights = {};
let rotatingParts = []; // Store parts to rotate
let rotationStartTime = null; // Time when rotation starts
let rotationDuration = 6000; // 5 seconds
let rotationPhase = 'forward';

// Load the GLB model using GLTFLoader
const loader = new GLTFLoader();
let object, leftModel, rightModel;
let slidingDirection = 0; // 0: not sliding, -1: left, 1: right
loader.load(
  '/model.glb', // Update the path to your .glb model
  (gltf) => {
    object = gltf.scene;

    // Adjust the object's position and scale for better visibility
    object.position.set(0, 0, 0);
    object.scale.set(2, 2, 2); // Adjust scale to fit model size
    scene.add(object);

    // Traverse the model to list all parts in the dropdown and create LED lights
    object.traverse((child) => {
      if (child.isMesh) {
        // Store original materials
        originalMaterials[child.uuid] = child.material.clone();

        // Store the selectable parts by UUID (unique identifier)
        selectableParts[child.uuid] = child;
        child.castShadow = true
        child.receiveShadow = true

        // Create an option for each part and add to the dropdown
        const option = document.createElement('option');
        option.value = child.uuid; // Use UUID for unique identification
        // option.textContent = child.name || `Unnamed Part ${dropdown.options.length + 1}`;
        // dropdown.appendChild(option);

        // Create LED light for specific parts
        if (ledParts.includes(child.name)) {
          const ledLight = new THREE.PointLight(0xF7F0DC, 7, 20, 0.1); // LED light
          ledLight.position.copy(child.position); // Position it at the part's location
          ledLight.castShadow = true;
          scene.add(ledLight);
          ledLights[child.uuid] = ledLight;

          // Create checkbox for this LED light
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `led-${child.uuid}`;
          checkbox.checked = true; // Initially unchecked
          const label = document.createElement('label');
          label.htmlFor = checkbox.id;
          label.textContent = `LED for ${child.name}`;
          label.style.backgroundColor = '#e0e0e0'; // Light gray background for labels
          label.style.padding = '5px'; // Padding around text
          label.style.marginRight = '10px'; // Space between checkbox and label
          ledContainer.appendChild(checkbox);
          ledContainer.appendChild(label);
          ledContainer.appendChild(document.createElement('br'));
          ledCheckboxes[child.uuid] = checkbox;
        }

        // Group nodes by their names
        if (child.name) {
          if (!groups[child.name]) {
            groups[child.name] = [];
          }
          groups[child.name].push(child);

          // Add parts with names matching pattern to rotatingParts array
          if (child.name.match(/^3DGeom-26/)) {
            rotatingParts.push(child);
          }
        }
      }
    });

    // Populate the group dropdown with group names
    for (const groupName in groups) {
      const option = document.createElement('option');
      option.value = groupName;
      option.textContent = groupName;
      groupDropdown.appendChild(option);
    }

    // Show resize options when a group is selected
    groupDropdown.addEventListener('change', (event) => {
      const selectedGroup = event.target.value;
      if (selectedGroup) {
        resizeContainer.style.display = 'block';
        widthInput.value = '';
        heightInput.value = '';
        depthInput.value = '';
      } else {
        resizeContainer.style.display = 'none';
      }
    });

    // Apply resizing to selected group
    applyButton.addEventListener('click', () => {
      const groupName = groupDropdown.value;
      const width = parseFloat(widthInput.value);
      const height = parseFloat(heightInput.value);
      const depth = parseFloat(depthInput.value);
      if (groupName && !isNaN(width) && !isNaN(height) && !isNaN(depth)) {
        const group = groups[groupName];
        group.forEach((node) => {
          node.scale.set(width, height, depth);
        });
      }
    });


    // Handle LED light checkboxes to toggle light visibility
    ledContainer.addEventListener('change', (event) => {
      if (event.target.tagName === 'INPUT') {
        const uuid = event.target.id.replace('led-', '');
        if (ledLights[uuid]) {
          ledLights[uuid].visible = event.target.checked;
        }
      }
    });

    // Start rotation animation when the button is clicked
    rotateButton.addEventListener('click', () => {
      rotationStartTime = performance.now(); // Start timing
    });

    // Add shadows to all parts when the button is clicked
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(selectableParts));

      // Reset previous highlights
      Object.values(selectableParts).forEach((part) => {
        part.material = originalMaterials[part.uuid].clone(); // Restore original material
      });

      if (intersects.length > 0) {
        const intersectedPart = intersects[0].object;
        intersectedPart.material = new THREE.MeshStandardMaterial({
          color: 0xffff00, // Yellow for hover highlight
          emissive: 0xffff00,
          emissiveIntensity: 1.0,
          metalness: 0.6,
          roughness: 0.4,
        });
        const partName = intersectedPart.name || 'Unnamed Part';
        nameDisplayBox.textContent = `Highlighted: ${partName}`;
      } else {
        // Clear the box if no object is highlighted
        nameDisplayBox.textContent = '';
          }
    }

    window.addEventListener('click', onMouseMove, false);
    // Function to handle traversing and dropdown logic for leftModel and rightModel only
    function processSideModel(model) {
      model.traverse((child) => {
        if (child.isMesh) {
          // Store original materials
          originalMaterials[child.uuid] = child.material.clone();
    
          // Store the selectable parts by UUID (unique identifier)
          selectableParts[child.uuid] = child;
          child.castShadow = true;
          child.receiveShadow = true;
    
          // Create an option for each part and add to the dropdown
          const option = document.createElement('option');
          option.value = child.uuid; // Use UUID for unique identification
          // option.textContent = child.name || `Unnamed Part ${dropdown.options.length + 1}`;
          // dropdown.appendChild(option);
    
          // Group nodes by their names
          if (child.name) {
            if (!groups[child.name]) {
              groups[child.name] = [];
            }
            groups[child.name].push(child);
          }
        }
      });
    }
    
    function processSideModel(model) {
      model.traverse((child) => {
        if (child.isMesh) {
          // Store original materials
          originalMaterials[child.uuid] = child.material.clone();
    
          // Store the selectable parts by UUID (unique identifier)
          selectableParts[child.uuid] = child;
          child.castShadow = true;
          child.receiveShadow = true;
    
          // Create an option for each part and add to the dropdown
          const option = document.createElement('option');
          option.value = child.uuid; // Use UUID for unique identification
          // option.textContent = child.name || `Unnamed Part ${dropdown.options.length + 1}`;
          // dropdown.appendChild(option);
    
          // Group nodes by their names
          if (child.name) {
            if (!groups[child.name]) {
              groups[child.name] = [];
            }
            groups[child.name].push(child);
          }
        }
      });
    }
    
    loader.load('/model2.glb', (gltf2) => {
      // Attach model2 to the left of model
      leftModel = gltf2.scene.clone();
      leftModel.position.set(0, 0, 0); // Adjust position for the left model
      leftModel.scale.set(2, 2, 2);
      scene.add(leftModel);
      processSideModel(leftModel);
    
      // Attach model2 to the right of model
      rightModel = gltf2.scene.clone();
      rightModel.position.set(0, 0, -7.4); // Adjust position for the right model
      rightModel.scale.set(2, 2, 2);
      scene.add(rightModel);
      processSideModel(rightModel);
    
      setupSlideButton(); // Setup slide button once models are loaded
    });
    
    function setupSlideButton() {
      const slideButton = document.createElement('button');
      slideButton.textContent = 'Slide Glasses';
      slideButton.style.position = 'absolute';
      slideButton.style.top = '350px';
      slideButton.style.left = '10px';
      slideButton.style.padding = '10px';
      document.body.appendChild(slideButton);
    
      slideButton.addEventListener('click', () => {
        if (slidingDirection === 0) {
          slidingDirection = 1; // Start sliding to the right
          slideButton.textContent = 'Stop Sliding'; // Change button text
          slidingStartTime = performance.now(); // Record the start time
        } else {
          slidingDirection = 0; // Stop sliding
          slideButton.textContent = 'Slide Glasses'; // Reset button text
          slidingStartTime = null; // Clear start time
        }
      });
    }
    
    const SLIDE_DURATION = 5000; // Duration of sliding in milliseconds
    let slidingDirection = 0; // 1 for right, -1 for left, 0 for stopped
    let slidingStartTime = null; // Start time for sliding
    
    // Function to slide nodes smoothly to the top of 3DGeom-20_2 in the showing order
    function slideNodes(model, slideAmount) {
      const glassesOrder = ['3DGeom-20_2', '3DGeom-20_1', '3DGeom-20', '3DGeom-20_3'];
      const targetNodeName = '3DGeom-20_2';
      let targetPosition = new THREE.Vector3(0, 0, 0); // Default target position
      
      // Find the target node's position
      model.traverse((child) => {
        if (child.isMesh && child.name.match(targetNodeName)) {
          targetPosition.set(child.position.x, child.position.y, child.position.z);
        }
      });
    
      let outOfBounds = false; // Flag to check if any node is out of bounds
      
      // Slide nodes to the top of 3DGeom-20_2 in the order specified by glassesOrder
      model.traverse((child) => {
        if (child.isMesh && glassesOrder.includes(child.name)) {
          const index = glassesOrder.indexOf(child.name);
    
          // Slide each node relative to its current position
          if (child.name !== targetNodeName) { // Do not slide the target node itself
            const desiredY = targetPosition.y + ((index - glassesOrder.indexOf(targetNodeName)) * slideAmount); // Offset based on order
            
            // Slide the node incrementally towards the desired position
            if (Math.abs(child.position.y - desiredY) > 0.01) { // If not close enough
              child.position.y += (desiredY - child.position.y) * 0.1; // Move towards desired position
            }
            
            // Check if any node is out of reasonable bounds (adjust these bounds as necessary)
            if (child.position.y > 10 || child.position.y < -10) { 
              outOfBounds = true; // Node is out of bounds
            }
          }
        }
      });
    
      return outOfBounds;
    }
    
    // Animation loop to render the scene and rotate parts
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    
      if (slidingDirection !== 0) {
        const slideAmount = 0.1 * slidingDirection; // Adjust sliding speed
    
        // Check if the sliding duration has elapsed
        if (slidingStartTime !== null) {
          const elapsedTime = performance.now() - slidingStartTime;
          if (elapsedTime > SLIDE_DURATION) {
            slidingDirection = 0; // Stop sliding after the duration
            slidingStartTime = null; // Clear start time
            document.querySelector('button').textContent = 'Slide Glasses'; // Reset button text
          }
        }
    
        // Slide nodes in the left and right models and check bounds
        const leftOutOfBounds = slideNodes(leftModel, slideAmount);
        const rightOutOfBounds = slideNodes(rightModel, slideAmount);
    
        // Reverse direction if any node is out of bounds
        if (leftOutOfBounds || rightOutOfBounds) {
          slidingDirection *= -1; // Reverse the sliding direction
        }
      }
    
      // Rotate parts if the rotationStartTime is set
      if (rotationStartTime !== null) {
        const elapsedTime = performance.now() - rotationStartTime;
        const progress = Math.min(elapsedTime / rotationDuration, 1); // Calculate progress as a fraction
        let angle;
    
        if (rotationPhase === 'forward') {
          angle = progress * 0.5 * Math.PI; // 90 degrees in radians
          if (progress === 1) {
            rotationPhase = 'backward'; // Switch to backward rotation when forward rotation is done
            rotationStartTime = performance.now(); // Reset start time for reverse rotation
          }
        } else if (rotationPhase === 'backward') {
          angle = Math.PI / 2 - (progress * 0.5 * Math.PI); // Return to original position
          if (progress === 1) {
            rotationStartTime = null; // Stop rotation when done
          }
        }
    
        rotatingParts.forEach((part) => {
          part.rotation.y = angle; // Rotate around Y-axis
        });
      }
    }
    
    animate(); // Start the animation loop
    
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.error('An error occurred while loading the model', error);
  },
  

  
);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
