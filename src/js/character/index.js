import { KeyDisplay } from './utils';
import { CharacterControls } from './characterControls';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

//* Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

//* Create the camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

//* Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

//* Create the orbit controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.update();

//* Create the clock
const clock = new THREE.Clock();

const keysPressed = {};
const keyDisplayQueue = new KeyDisplay();
const clockRun = new THREE.Clock();
const lastKey = { key: '', time: 0 };

window.addEventListener('resize', WindowResizeHandler);
document.body.appendChild(renderer.domElement);
addKeyboardListener();


light();
generateFloor();

let characterControls = null;
loadCharacter();

animate();


//* key press handling
function addKeyboardListener() {
    document.addEventListener('keydown', (event) => {
        keyDisplayQueue.down(event.key);

        if (keysPressed[event.key.toLowerCase()]) return;

        if (event.key == lastKey.key && clockRun.getElapsedTime() - lastKey.time < 0.5) {
            lastKey.time = 0;
            lastKey.key = '';
            characterControls.setRun(true);
        }
        
        keysPressed[event.key.toLowerCase()] = true;
        lastKey.key = event.key;
        lastKey.time = clockRun.getElapsedTime();

    }, false);

    document.addEventListener('keyup', (event) => {
        keyDisplayQueue.up(event.key);
        keysPressed[event.key.toLowerCase()] = false;
        characterControls.setRun(false);
    }, false);
}

//* Animation loop
function animate() {
    const mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

//* Resize handling
function WindowResizeHandler() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    keyDisplayQueue.updatePosition();
}

function generateFloor() {
    const textureLoader = new THREE.TextureLoader();
    const placeholder = textureLoader.load("./textures/placeholder/placeholder.png");
    const sandBaseColor = textureLoader.load("./textures/sand/Sand 002_COLOR.jpg");
    const sandNormalMap = textureLoader.load("./textures/sand/Sand 002_NRM.jpg");
    const sandHeightMap = textureLoader.load("./textures/sand/Sand 002_DISP.jpg");
    const sandAmbientOcclusion = textureLoader.load("./textures/sand/Sand 002_OCC.jpg");
    const grassBaseColor = textureLoader.load("./textures/grass/grass.png");

    const WIDTH = 50;
    const LENGTH = 50;

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshStandardMaterial({
        map: sandBaseColor,
        normalMap: sandNormalMap,
        displacementMap: sandHeightMap,
        displacementScale: 0.1,
        aoMap: sandAmbientOcclusion
    });

    function wrapAndRepeatTexture(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
    }

    wrapAndRepeatTexture(material.map);
    wrapAndRepeatTexture(material.normalMap);
    wrapAndRepeatTexture(material.displacementMap);
    wrapAndRepeatTexture(material.aoMap);

    const floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
}


function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-60, 100, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
}

function loadCharacter() {
    new GLTFLoader().load('models/Soldier.glb', function (gltf) {
        const model = gltf.scene;
        model.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        scene.add(model);

        const gltfAnimations = gltf.animations;
        const mixer = new THREE.AnimationMixer(model);
        const animationsMap = new Map();
        gltfAnimations.filter(a => a.name != 'TPose').forEach((a) => {
            animationsMap.set(a.name, mixer.clipAction(a));
        });

        characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, 'Idle');
    });
}