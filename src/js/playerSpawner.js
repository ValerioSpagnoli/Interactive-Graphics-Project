import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CharacterFSM } from './finiteStateMachine';


export class PlayerSpawner {
    constructor (params) {
        this._Init(params);
    }

    _Init (params) {
        this._params = params;
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3();
        this._previousPosition = new THREE.Vector3();

        this._animations = {};
        this._input = new PlayerSpawnerInput();
        this._stateMachine = new CharacterFSM(
            new PlayerSpawnerProxy(this._animations)
        );

        this._worldBoundingBoxes = [];
        for (const b of this._params.world.boundingBoxes) {
          this._worldBoundingBoxes.push(b);
        }

        this._hitFlag = false;
        this._hitTime = 0;  
        this._hitDirection = new THREE.Vector3(); 
        this._hitIntensity = 1;
        
        this._normalScale = 0.06;
        this._bigScale = 0.1;
        
        this._normalDamage = this._params.powerBar.swords.length;
        this._bigDamage = this._params.powerBar.swords.length*2;
        this._damage = this._normalDamage;
        
        this._normalAttackRange = 10; 
        this._bigAttackRange = 25;
        this._attackRange = this._normalAttackRange;
        
        this._starsToGetBigger = 1;
        this._transformed = false;
        this._timeTransformed = 0;
        this._transformationTime = 15000;
        this._starsTransformationSpawner = new StarsTransformationSpawner(this._params);
        
        this._LoadModels();
      }

    _LoadModels() {
        const loader = new FBXLoader();
        loader.setPath('./models/knight/');
        loader.load('knight.fbx', (fbx) => {
          fbx.scale.setScalar(this._normalScale);
          fbx.traverse(c => {
            c.castShadow = true;
          });
          fbx.position.set(0, 0, 190);
          fbx.rotation.y = 0;
          
          this._target = fbx;
          this._params.scene.add(this._target);
    
          this._mixer = new THREE.AnimationMixer(this._target);
    
          this._manager = new THREE.LoadingManager();
          this._manager.onLoad = () => {
            this._stateMachine.SetState('idle');
          };
    
          const _OnLoad = (animName, anim) => {
            const clip = anim.animations[0];
            const action = this._mixer.clipAction(clip);
      
            this._animations[animName] = {
              clip: clip,
              action: action,
            };
          };
    
          const loader = new FBXLoader(this._manager);
          loader.setPath('./models/knight/');
          loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
          loader.load('run.fbx', (a) => { _OnLoad('run', a); });
          loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
          loader.load('attack_1.fbx', (a) => { _OnLoad('attack_1', a); });
          loader.load('attack_2.fbx', (a) => { _OnLoad('attack_2', a); });
          loader.load('death.fbx', (a) => { _OnLoad('death', a); });
        });
    }

    get position(){
        return this._position;
    }

    get previousPosition(){
        return this._previousPosition;
    }

    get rotation(){
        if (!this._target) {
            return new THREE.Quaternion();
        }
        return this._target.quaternion;
    }   

    set rotation(value){
        if (!this._target) {
            return;
        }
        this._target.quaternion.copy(value);
    }

    get keyPressed() {
        const keys = this._input._keys;
        const keyPressed = {'w': keys.forward, 'a': keys.left, 's': keys.backward, 'd': keys.right, 'shift': keys.shift, 'space': keys.space};
        return keyPressed;
    }

    get hitFlag() {
        return this._hitFlag;
    }

    set hitFlag(value) {
        this._hitFlag = value;
    }

    get hitDirection() {
        return this._hitDirection;
    }

    set hitDirection(value) {
        this._hitDirection = value;
    }

    get hitIntensity() {
        return this._hitIntensity;
    }

    set hitIntensity(value) {
        this._hitIntensity = value;
    }

    get damage() {
        return this._damage;
    }

    get attackRange() {
        return this._attackRange;
    }

    get transformed() {
        return this._transformed;
    }

    get timeTransformed() {
        return this._timeTransformed;
    }

    get transformationTime() {
        return this._transformationTime;  
    }

    _PlayerMovementHandler(time){ 
      const velocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(time);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));

      velocity.add(frameDecceleration);

      const player = this._target;
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3(); 
      const _R = player.quaternion.clone();

      const acceleration = this._acceleration.clone();
      if (this._input._keys.shift) {
          acceleration.multiplyScalar(3.0);
      }

      if (this._input._keys.forward) {
          velocity.z += acceleration.z * time;
      }
      if (this._input._keys.backward) {
          velocity.z -= acceleration.z * time;
      }
      if (this._input._keys.left) {
          _A.set(0, 1, 0);
          _Q.setFromAxisAngle(_A, 4.0 * Math.PI * time * this._acceleration.y);
          _R.multiply(_Q);
      }
      if (this._input._keys.right) {
          _A.set(0, 1, 0);
          _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * time * this._acceleration.y);
          _R.multiply(_Q);
      }

      player.quaternion.copy(_R);
      
      const oldPosition = new THREE.Vector3();
      oldPosition.copy(player.position);

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(player.quaternion);
      forward.normalize();
      forward.multiplyScalar(velocity.z * time);
      player.position.add(forward);

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(player.quaternion);
      sideways.normalize();
      sideways.multiplyScalar(velocity.x * time);
      player.position.add(sideways);

      this._worldBoundingBoxes.map(b => {
        const box = new THREE.Box3().setFromObject(b);
        if (box.containsPoint(player.position)){
          player.position.copy(oldPosition);
        }
      });

      this._position.copy(player.position);
      this._previousPosition.copy(oldPosition);
    }

    _DeathHandler(){  
      if (this._params.healthBar.hearts.length === 0) this._stateMachine.SetState('death');
    }

    _HitHandler(){
      if (this._hitFlag){
        const randomSign = Math.random() < 0.5 ? -1 : 1;
        this._target.rotation.y += (Math.PI / 40) * randomSign;
        const newPosition = this._target.position.z - this._hitDirection.z * this._hitIntensity;
        let isValid = true;
        for (const b of this._params.world.boundingBoxes) {
          const box = new THREE.Box3().setFromObject(b);
          if (box.containsPoint(new THREE.Vector3(this._target.position.x, this._target.position.y, newPosition))) {
            isValid = false;
            break;
          }
        }
        if (isValid) {
          this._target.position.z = newPosition;
        }
        this._hitTime = Date.now();
      }
    }

    _TransformationHandler(){
      this._normalDamage = this._params.powerBar.swords.length;
      this._bigDamage = this._params.powerBar.swords.length*2;

      if (this._params.starCounter.stars >= this._starsToGetBigger && !this._transformed) {
        this._transformed = true;
        this._timeTransformed = Date.now();
        this._params.starCounter.stars = 0;
        this._target.scale.setScalar(this._bigScale);
        this._damage = this._bigDamage;
        this._attackRange = this._bigAttackRange;
        if (this._params.healthBar.hearts.length < 10) {
          const numOfHearts = this._params.healthBar.hearts.length;
          for (let i = 0; i < 10 - numOfHearts; i++) {
            this._params.healthBar.addHeart();
          }
        }
        this._starsTransformationSpawner.createStars({x: this._position.x-10, y: this._position.y, z: this._position.z-10, width: 15, height: 30, depth: 15}, 300);
      }
      
      if (this._transformed && Date.now() - this._timeTransformed > this._transformationTime) {
        this._transformed = false;
        this._timeTransformed = 0;
        this._target.scale.setScalar(this._normalScale);
        this._damage = this._normalDamage;
        this._attackRange = this._normalAttackRange;
        if(this._params.powerBar.swords.length > 1){
          for (let i = 0; i < this._params.powerBar.swords.length / 2; i++) {
            this._params.powerBar.removeSword();
          }
        }
      }

      this._starsTransformationSpawner.updateStars();
    }

    Update(timeInSeconds) {
        if (!this._stateMachine._currentState) return;
        this._stateMachine._currentState.Update(timeInSeconds, this._input);
        
        this._DeathHandler();
        this._HitHandler();
        this._TransformationHandler();
        this._PlayerMovementHandler(timeInSeconds);

        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
}

class PlayerSpawnerProxy {
    constructor (animations) {
        this._animations = animations;
    }

    get animations () {
        return this._animations;
    }
}

class PlayerSpawnerInput {
    constructor() {
      this._Init();    
    }
  
    _Init() {
      this._keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        shift: false,
        ctrl: false,
      };
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }
  
    _onKeyDown(event) {
      switch (event.keyCode) {
        case 87: // w
          this._keys.forward = true;
          break;
        case 65: // a
          this._keys.left = true;
          break;
        case 83: // s
          this._keys.backward = true;
          break;
        case 68: // d
          this._keys.right = true;
          break;
        case 32: // SPACE
          this._keys.space = true;
          break;
        case 16: // SHIFT
          this._keys.shift = true;
          break;
        case 17: // CTRL
          this._keys.ctrl = true;
          break
      }
    }
  
    _onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this._keys.forward = false;
          break;
        case 65: // a
          this._keys.left = false;
          break;
        case 83: // s
          this._keys.backward = false;
          break;
        case 68: // d
          this._keys.right = false;
          break;
        case 32: // SPACE
          this._keys.space = false;
          break;
        case 16: // SHIFT
          this._keys.shift = false;
          break;
        case 17: // CTRL
          this._keys.ctrl = false;
          break;
      }
    }
};

class StarsTransformationSpawner {
    constructor(params) {
        this._params = params;  
        this.scene = this._params.scene;
        this._stars = [];
    }
    
    createStars(area, amount) {
        let particles = [];
        for (let i = 0; i < amount; i++) {
            const particle = new StarParticle();
            particle.mesh.position.set(
                area.x + Math.random() * area.width,
                area.y + Math.random() * area.height,
                area.z + Math.random() * area.depth
            );
            this.scene.add(particle.mesh);
            particles.push(particle);
        }
        this._stars.push({'particles': particles, 'time': Date.now()});
    }

    removeStars(particles) {
        particles.forEach((particle) => {
            this.scene.remove(particle.mesh);
        });
    }   
    
    updateStars() {
        for (let i = 0; i < this._stars.length; i++) {
            if (Date.now() - this._stars[i].time >= 8000) {
                this.removeStars(this._stars[i].particles);
                this._stars.splice(i, 1);
            }
            else{
                this._stars[i].particles.forEach((particle) => {
                    particle.update();
                });
            }
        }
    }
}

class StarParticle {
    constructor() {
        this.colors = [0xffc812, 0xbd930b, 0xdbb539];
        this.mesh = new THREE.Mesh(
          new THREE.SphereGeometry(Math.random()*0.5 + 0.01, Math.random() * 1 + 5, Math.random() * 1 + 5),
            new THREE.MeshBasicMaterial({
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                opacity: 1,
                transparent: false,
            })
        );
        this.mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        this.velocity = new THREE.Vector3(
            (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.5 - 0.05,
            -Math.random() * 0.5 - 0.05,
            (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.5 - 0.05
        );
    }
    
    update() {
        if (this.mesh.position.y <= 0.1) {
            this.mesh.position.y = 0.1;
            this.mesh.velocity = new THREE.Vector3(0, 0, 0);
        }
        else{
            this.mesh.position.add(this.velocity);
        }
    }
}