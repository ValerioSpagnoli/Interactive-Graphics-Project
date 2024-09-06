import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class MobSpawner {

    constructor(params) {
        this._params = params;
        this._mobs = [];
        this._worldBoundingBoxes = [];
        for (const b of this._params.world.BoundingBoxes) {
            this._worldBoundingBoxes.push(b);
        }
        this._playerPosition = this._params.playerPosition;

        this._mobAttackDistance = 8;
        this._mobAttackTime = 500;
        this._lastSpawnTime = 0;    
        this._minNumberOfMobs = 12;
        
        this._LoadModels();
    }

    get Mobs() {
        return this._mobs;
    }

    get MobAttackDistance() {
        return this._mobAttackDistance;
    }

    get MobAttackTime() {
        return this._mobAttackTime;
    }

    _LoadModels() {
        const loader = new GLTFLoader();

        this._mobPositions = [];
        this._mobPositions.push(new THREE.Vector3(0, 1, 50));
        this._mobPositions.push(new THREE.Vector3(0, 1, 110));
        this._mobPositions.push(new THREE.Vector3(-50, 1, 30));
        this._mobPositions.push(new THREE.Vector3(50, 1, 30));
        this._mobPositions.push(new THREE.Vector3(80, 1, 130));
        this._mobPositions.push(new THREE.Vector3(-80, 1, 130));
        this._mobPositions.push(new THREE.Vector3(-150, 1, 100));
        this._mobPositions.push(new THREE.Vector3(150, 1, 100));
        this._mobPositions.push(new THREE.Vector3(-110, 1, 50));
        this._mobPositions.push(new THREE.Vector3(110, 1, 50));
        this._mobPositions.push(new THREE.Vector3(-120, 1, 0));
        this._mobPositions.push(new THREE.Vector3(120, 1, 0));
    
        const k = this._mobPositions.length;
    
        for (let i = 0; i < k; i++) {
            this._LoadModel(loader, this._mobPositions[i]);
        }

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

    _LoadModel(loader, position){
        let mob_ = {'mob':null, 'mixer':null, 'walk':null, 'attack':null, 'dead':null, 'currentAction':null, 'velocity':null, 'time':0, 'life':6, 'lastHit':0, 'deadFlag':false, 'deadTime':0, 'position':null, 'rotation':null};    
        loader.load('./models/mob/blue_demon.glb', (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
            });
            const mob = gltf.scene;
            mob.scale.set(3, 3, 3);
            mob.position.set(position.x, position.y, position.z);
            this._params.scene.add(mob);
            mob_.mob = mob;
            mob_.position = mob.position;
            mob_.rotation = mob.rotation;
            mob_.velocity = new THREE.Vector3(0, 0, 1);

            const mixer = new THREE.AnimationMixer(mob);
            const walk = mixer.clipAction(gltf.animations[11]); // Walk animation
            const attack = mixer.clipAction(gltf.animations[13]); // Attack animation
            const dead = mixer.clipAction(gltf.animations[0]); // Death animation
            walk.play();
            
            mob_.walk = walk;
            mob_.attack = attack;
            mob_.dead = dead;
            mob_.currentAction = walk;
            mob_.mixer = mixer;

            this._mobs.push(mob_);
        });
    }
    
    update(deltaTime) {

        if(Date.now() - this._lastSpawnTime > 10000 && this._mobs.length < this._minNumberOfMobs){
            this._lastSpawnTime = Date.now();
            const k = this._mobPositions.length;
            this._LoadModel(new GLTFLoader(), this._mobPositions[Math.floor(Math.random() * k)]);
        }
        
        for (const mixer of this._mobs.map(m => m.mixer)) {
            mixer.update(deltaTime);
        }

        
        for (const mob of this._mobs) {
            const distanceToPlayer = this._playerPosition.distanceTo(mob.position);
            let playerInsideBoundingBoxes = false;
            for (const b of this._worldBoundingBoxes) {
                const box = new THREE.Box3().setFromObject(b);
                if (box.containsPoint(this._playerPosition)) {
                    playerInsideBoundingBoxes = true;
                    break;
                }
            }

            if(mob.currentAction !== mob.dead) {
                if (distanceToPlayer < 60 && !playerInsideBoundingBoxes) {
                    this.moveMobTowardsPlayer(mob, this._playerPosition);
                } else {
                    this.moveMobRandomly(mob);
                }
            }
        
            if (mob.life <= 0) {
                this.dead(mob);
            }
        }
    }

    moveMobTowardsPlayer(mob, playerPosition) {
        const mobPosition = mob.position;
        const mobVelocity = mob.velocity;
        const distanceToPlayer = playerPosition.distanceTo(mobPosition);
        
    
        if (distanceToPlayer < this._mobAttackDistance) {
            if (mob.currentAction !== mob.attack) {
                mob.currentAction.stop();
                mob.currentAction = mob.attack; 
                mob.currentAction.play();
            }
        } 
        else {
            mobVelocity.copy(playerPosition).sub(mobPosition).normalize().multiplyScalar(0.1);
            mobPosition.add(mobVelocity);
            const angle = Math.atan2(mobVelocity.x, mobVelocity.z);
            mob.mob.rotation.y = angle;

            if (distanceToPlayer < this._mobAttackDistance) {
                mob.currentAction.stop();
            }
    
            if (mob.currentAction !== mob.walk) {
                mob.currentAction.stop();
                mob.currentAction = mob.walk;
                mob.currentAction.play();
            }
        }
    }

    moveMobRandomly(mob) {
        const mobPosition = mob.position;
        const mobVelocity = mob.velocity;
        const mobTime = mob.time;
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - mobTime;
    
        if (timeDiff > 5000) {
            mobVelocity.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
            mobVelocity.normalize().multiplyScalar(0.1);
            mob.time = currentTime;
        }
    
        for (const b of this._worldBoundingBoxes) {
            const box = new THREE.Box3().setFromObject(b);
            if (box.containsPoint(mobPosition)) {
                mobVelocity.set(-mobVelocity.x, 0, -mobVelocity.z);
                mobVelocity.normalize().multiplyScalar(0.1);
                mob.time = currentTime;
            }
        }
    
        mobPosition.add(mobVelocity);
        const angle = Math.atan2(mobVelocity.x, mobVelocity.z);
        mob.mob.rotation.y = angle;
    }

    dead(mob) {
        if(!mob.deadFlag){
            mob.currentAction.stop();
            mob.currentAction = mob.dead;
            mob.currentAction.play();
            mob.deadFlag = true;
            mob.deadTime = new Date().getTime();
        }
        else{
            if(new Date().getTime() - mob.deadTime > 10000){
                this._params.scene.remove(mob.mob);
                this._mobs = this._mobs.filter(m => m !== mob);
            }
            else{                
                if (mob.currentAction.time > mob.currentAction.getClip().duration - 0.1) {
                    mob.currentAction.paused = true;
                }
            }
        }
    }
}