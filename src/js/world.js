// create a class that loads the world in "scene_objects/scene.glb"
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class World {
    constructor(params) {
        this._params = params;
        this._Init();
    }
    
    _Init() {
        this._boundingBoxes = [];
        this._AddFloor();
        this._AddModel();
        this._AddLights();
        this._AddBoundingBoxes();
    }

    _AddFloor() {
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            }));
        floor.castShadow = false;
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;
        this._params.scene.add(floor);
    }

    _AddModel() {
        const loader = new GLTFLoader();
        loader.load('./models/scene_objects/scene.glb', (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
            });
            gltf.scene.position.set(1, 1, 1);
            gltf.scene.scale.set(20, 20, 20);
            this._params.scene.add(gltf.scene);
        });
    }

    _AddLights(){
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(-100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 50;
        light.shadow.camera.right = -50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        this._params.scene.add(light);
    
        light = new THREE.AmbientLight(0xFFFFFF, 0.25);
        this._params.scene.add(light);
    }

    _AddBoundingBoxes() {
        // create a wireframe box to represent a custom bounding box of dimensions 1x1x1
        const geometry = new THREE.BoxGeometry(40, 50, 40);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(-45, 25, 185);
        this._params.scene.add(cube);

        this._boundingBoxes.push(cube);
    
    }

    get BoundingBoxes() {
        return this._boundingBoxes;
    }
}