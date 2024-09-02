import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Death: 0
// Run: 9
// Walk: 11
// Attack: 13

export class MobSpawner {

    constructor(params) {
        this._params = params;
        this._mobs = [];
        this._worldBoundingBoxes = [];
        for (const b of this._params.world.BoundingBoxes) {
            this._worldBoundingBoxes.push(b);
        }

        this._LoadModels();
    }

    _LoadModels() {
        const loader = new GLTFLoader();
    
        const mobPositions = [];
        mobPositions.push(new THREE.Vector3(0, 1, 50));
        mobPositions.push(new THREE.Vector3(0, 1, 110));
        mobPositions.push(new THREE.Vector3(0, 1, 150));
        mobPositions.push(new THREE.Vector3(0, 1, -50));
        mobPositions.push(new THREE.Vector3(-50, 1, 30));
        mobPositions.push(new THREE.Vector3(50, 1, 30));
        mobPositions.push(new THREE.Vector3(80, 1, 130));
        mobPositions.push(new THREE.Vector3(-80, 1, 130));
        mobPositions.push(new THREE.Vector3(100, 1, 100));
        mobPositions.push(new THREE.Vector3(-100, 1, 100));
    
        const k = mobPositions.length;
    
        for (let i = 0; i < k; i++) {
            let mob_ = {'mob':[], 'mixer':[], 'action':[], 'position':[], 'velocity':[], 'time':0};  
            loader.load('./models/mob/blue_demon.glb', (gltf) => {
                gltf.scene.traverse(c => {
                    c.castShadow = true;
                });
                const mob = gltf.scene;
                mob.scale.set(3, 3, 3);
                mob.position.set(mobPositions[i].x, mobPositions[i].y, mobPositions[i].z);
                this._params.scene.add(mob);
                mob_.mob = mob;
                mob_.position = mob.position;
                mob_.velocity = new THREE.Vector3(0, 0, 1);
    
                const mixer = new THREE.AnimationMixer(mob);
                const action = mixer.clipAction(gltf.animations[11]); // Walk animation
                action.play();
    
                mob_.action = action;
                mob_.mixer = mixer;

                this._mobs.push(mob_);
            });
        }

        //* Left tower
        const box_1 = new THREE.BoxGeometry(60, 50, 40);
        const mat_1 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: false,
        });
        const cube_1 = new THREE.Mesh(box_1, mat_1);
        cube_1.position.set(0, 25, 185);
        this._params.scene.add(cube_1);
        this._worldBoundingBoxes.push(cube_1);

        const box_2 = new THREE.BoxGeometry(30, 50, 10);
        const mat_2 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: false,
        });
        const cube_2 = new THREE.Mesh(box_2, mat_2);
        cube_2.position.set(0, 25, -70);
        this._params.scene.add(cube_2);
        this._worldBoundingBoxes.push(cube_2);
    }
    
    update(deltaTime) {
        for (const mixer of this._mobs.map(m => m.mixer)) {
            mixer.update(deltaTime);
        }
        const playerPosition = this._params.playerPosition;
        for (const mob of this._mobs) {
            if (playerPosition.distanceTo(mob.position) < 10) {
                this.moveMobsTowardsPlayer(playerPosition);
            }
            else {
                this.moveMobsRandomly();
            }
        }
    }

    moveMobsTowardsPlayer(playerPosition) {
        for (const mob of this._mobs) {
            const mobPosition = mob.position;
            const mobVelocity = mob.velocity;
            mobVelocity.copy(playerPosition).sub(mobPosition).normalize().multiplyScalar(0.01);
            mobPosition.add(mobVelocity);
        }
    }

    moveMobsRandomly() {
        for (const mob of this._mobs) {
            const mobPosition = mob.position;
            const mobVelocity = mob.velocity;
            const mobTime = mob.time;
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - mobTime;
            if (timeDiff > 5000) {
                mobVelocity.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
                mobVelocity.normalize().multiplyScalar(0.01);
                mob.time = currentTime;
            }
            for (const b of this._worldBoundingBoxes) {
                const box = new THREE.Box3().setFromObject(b);
                if (box.containsPoint(mobPosition)) {
                    mobVelocity.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
                    mobVelocity.normalize().multiplyScalar(0.01);
                    mob.time = currentTime;
                }
            }

            mobPosition.add(mobVelocity);
            const angle = Math.atan2(mobVelocity.x, mobVelocity.z);
            mob.mob.rotation.y = angle;
        }
    }

}