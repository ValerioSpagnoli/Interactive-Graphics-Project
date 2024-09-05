import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class HeartSpawner {
    constructor(params) {
        this._params = params;
        this._hearts = [];
        this._lastSpawnTime = 0;
        this._spawnInterval = 18;
        this._maxHearts = 5;
        this._worldBoundingBoxes = [];
        for (const b of this._params.world.BoundingBoxes) {
            this._worldBoundingBoxes.push(b);
        }
    }

    _LoadModels() {
        const loader = new GLTFLoader();
        this._lastSpawnTime = Date.now();
        loader.load('./models/scene_objects/heart.glb', (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
            });
            const heart = gltf.scene;
            heart.scale.set(5, 5, 5);
            
            let randomPos = new THREE.Vector3();
            let found = false;
            const insideTowers_box = new THREE.BoxGeometry(230, 50, 150);
            const insideTowers_mat = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
                visible: false,
            });
            const insideTowers = new THREE.Mesh(insideTowers_box, insideTowers_mat);
            insideTowers.position.set(0, 25, -130);
            this._params.scene.add(insideTowers);
            this._worldBoundingBoxes.push(insideTowers);

            while(!found) {
                randomPos.x = Math.random() * 200 - 100;
                randomPos.y = 4;
                randomPos.z = Math.random() * 200 - 100;
                found = true;
                for (const b of this._worldBoundingBoxes) {
                    const box = new THREE.Box3().setFromObject(b);
                    if(box.containsPoint(randomPos)){
                        found = false;
                        break;
                    }
                }
            }

            heart.position.set(randomPos.x, randomPos.y, randomPos.z);
            this._params.scene.add(heart);
            this._hearts.push(heart);
        }); 
    }

    Update(timeInSeconds) {
        if(Date.now() - this._lastSpawnTime > this._spawnInterval*1000 && this._hearts.length < this._maxHearts) {
            this._lastSpawnTime = Date.now();
            this._LoadModels();
        }

        this._hearts.map(s => {
            const rotationSpeed = 1;
            s.rotation.y += rotationSpeed * timeInSeconds;             
        });
    }

    get hearts() {
        return this._hearts;
    }

    set hearts(value) {
        this._hearts = value;
    }
}