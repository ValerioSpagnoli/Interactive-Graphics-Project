import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class StarsSpawner {
    constructor(params) {
        this._params = params;
        this._stars = [];
        this._LoadModels();
    }

    _LoadModels() {
        const loader = new GLTFLoader();

        const starPositions = [];
        starPositions.push(new THREE.Vector3(0, 1, 50));
        starPositions.push(new THREE.Vector3(0, 1, 110));
        starPositions.push(new THREE.Vector3(0, 1, 170));
        starPositions.push(new THREE.Vector3(0, 1, -50));
        starPositions.push(new THREE.Vector3(-50, 1, 30));
        starPositions.push(new THREE.Vector3(50, 1, 30));
        starPositions.push(new THREE.Vector3(80, 1, 130));
        starPositions.push(new THREE.Vector3(-80, 1, 130));
        starPositions.push(new THREE.Vector3(100, 1, 100));
        starPositions.push(new THREE.Vector3(-100, 1, 100));
        starPositions.push(new THREE.Vector3(-130, 1, 150));
        starPositions.push(new THREE.Vector3(130, 1, 150));
        starPositions.push(new THREE.Vector3(-150, 1, 110));
        starPositions.push(new THREE.Vector3(150, 1, 110));
        starPositions.push(new THREE.Vector3(-120, 1, 50));
        starPositions.push(new THREE.Vector3(120, 1, 50));
        starPositions.push(new THREE.Vector3(-120, 1, 0));
        starPositions.push(new THREE.Vector3(120, 1, 0));
        starPositions.push(new THREE.Vector3(50, 1, -20));
        starPositions.push(new THREE.Vector3(-50, 1, -20));
        starPositions.push(new THREE.Vector3(-150, 1, -70));
        starPositions.push(new THREE.Vector3(150, 1, -70));
        starPositions.push(new THREE.Vector3(140, 1, -130));
        starPositions.push(new THREE.Vector3(-140, 1, -130));

        const k = starPositions.length;
        for (let i = 0; i < k; i++) {
            loader.load('./models/scene_objects/star.glb', (gltf) => {
                gltf.scene.traverse(c => {
                    c.castShadow = true;
                });
                const star = gltf.scene;
                star.scale.set(3, 3, 3);
                star.position.set(starPositions[i].x, starPositions[i].y, starPositions[i].z);  
                this._params.scene.add(star);
                this._stars.push(star);
            });
        }
    }

    Update(timeInSeconds) {
        this._stars.map(s => {
            const rotationSpeed = 1;
            s.rotation.y += rotationSpeed * timeInSeconds;             
        });
    }

    get stars() {
        return this._stars;
    }

    set stars(value) {
        this._stars = value;
    }
}