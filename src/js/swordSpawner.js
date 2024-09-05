import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class SwordSpawner {
    constructor(params) {
        this._params = params;
        this._swords = [];
        this._lastSpawnTime = 0;
        this._spawnInterval = 30;
        this._maxSwords = 5;    
        this._worldBoundingBoxes = this._params.world.BoundingBoxes;
    }

    _LoadModels() {
        const loader = new GLTFLoader();
        this._lastSpawnTime = Date.now();
        loader.load('./models/scene_objects/sword.glb', (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
            });
            const sword = gltf.scene;
            sword.scale.set(20, 20, 20);
            
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

            sword.position.set(randomPos.x, randomPos.y, randomPos.z);
            sword.rotation.x = Math.PI/4;
            this._params.scene.add(sword);
            this._swords.push(sword);
        }); 
    }

    Update(timeInSeconds) {
        if(Date.now() - this._lastSpawnTime > this._spawnInterval*1000 && this._swords.length < this._maxSwords) {
            this._lastSpawnTime = Date.now();
            this._LoadModels();
        }

        this._swords.map(s => {
            const rotationSpeed = 1;
            s.rotation.z += rotationSpeed * timeInSeconds;             
        });
    }

    get swords() {
        return this._swords;
    }

    set swords(value) {
        this._swords = value;
    }
}