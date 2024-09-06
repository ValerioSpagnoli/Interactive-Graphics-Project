import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CharacterFSM } from './finiteStateMachine';


export class BasicCharacterController {
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
        this._input = new BasicCharacterControllerInput();
        this._stateMachine = new CharacterFSM(
            new BasicCharacterControllerProxy(this._animations)
        );

        this._lastTimeFPressed = 0;

        this._LoadModels();
        this._AddBoundingBox();

        this._hitFlag = false;
        
        this._normalScale = 0.06;
        this._bigScale = 0.1;
        
        this._normalDamage = Math.ceil(this._params.powerBar.swords.length / 2);
        this._bigDamage = this._params.powerBar.swords.length;
        this._damage = this._normalDamage;

        this._normalAttackRange = 10; 
        this._bigAttackRange = 25;
        this._attackRange = this._normalAttackRange;
        
        this._starsToGetBigger = 5;
        this._transformed = false;
        this._timeTransformed = 0;
        this._transformationTime = 15000;
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
          fbx.rotation.y = Math.PI;
    
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
          loader.load('attack.fbx', (a) => { _OnLoad('attack', a); });
          loader.load('death.fbx', (a) => { _OnLoad('death', a); });
          loader.load('hit.fbx', (a) => { _OnLoad('hit', a); });
        });
    }

    _AddBoundingBox(){
      const geometry = new THREE.BoxGeometry(8, 16, 8);
      const material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
          visible: false,
      });
      this._cube = new THREE.Mesh(geometry, material);
      this._cube.position.set(0, 7, 0);
      this._params.scene.add(this._cube);
    }

    get Position(){
        return this._position;
    }

    get PreviousPosition(){
        return this._previousPosition;
    }

    get Rotation(){
        if (!this._target) {
            return new THREE.Quaternion();
        }
        return this._target.quaternion;
    }   

    get BoundingBox(){
        return this._cube;
    }

    get lastTimeFPressed() {
        return this._lastTimeFPressed;
    }

    set lastTimeFPressed(value) {
        this._lastTimeFPressed = value;
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

    Update(timeInSeconds) {
        if (!this._stateMachine._currentState) {
            return;
        }
        this._stateMachine._currentState.Update(timeInSeconds, this._input);
        
        if (this._params.healthBar.hearts.length === 0) {
          this._stateMachine.SetState('death');
        }

        this._normalDamage = Math.ceil(this._params.powerBar.swords.length / 2);
        this._bigDamage = this._params.powerBar.swords.length;
 
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

        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3(); 
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        if (this._input._keys.shift) {
            acc.multiplyScalar(3.0);
        }

        if (this._input._keys.forward) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this._input._keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this._input._keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._input._keys.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }

        controlObject.quaternion.copy(_R);
        
        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        this._cube.position.copy(controlObject.position);
        this._cube.position.y = 7;

        this._position.copy(controlObject.position);
        this._previousPosition.copy(oldPosition);

        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
}

class BasicCharacterControllerProxy {
    constructor (animations) {
        this._animations = animations;
    }

    get animations () {
        return this._animations;
    }
}

class BasicCharacterControllerInput {
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
        f: false,
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
        case 70: // F
          this._keys.f = true;
          break;
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
        case 70: // F
          this._keys.f = false;
          break;
      }
    }
};