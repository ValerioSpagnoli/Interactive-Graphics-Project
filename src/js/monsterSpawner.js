import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export class MonsterSpawner {

    constructor(params) {
        this._params = params;
        this._animations = {};
        this._velocity = new THREE.Vector3();  
        this._position = new THREE.Vector3();
        this._previousPosition = new THREE.Vector3();
        
        this._worldBoundingBoxes = [];
        for (const b of this._params.world.boundingBoxes) {
          this._worldBoundingBoxes.push(b);
        }
        this._playerPosition = this._params.playerPosition;
        
        this._monsterAttackRange = {'min': 15, 'max': 20};  
        this._monsterAttackTime = this._params.monsterAttackTime;   
        this._LoadModel();
        
        this._timeLastWalk = 0;
        this._timeLastIdle = 0;
        this._timeLastAttack = 0;
        this._timeLastRoar = 0;

        this._monsterLife = 100;
        this._monsterDamage = 2;  
        this._monsterLastHit = 0; 
        this._monsterState = 'roar';

        this._stateMachine = new CharacterFSM(this._animations, this.monsterAttackRange);
    }

    get monsterAttackRange() {
        return this._monsterAttackRange;
    }

    get monsterAttackTime() {
        return this._monsterAttackTime;
    }

    get monsterDamage() {
        return this._monsterDamage;
    }

    set monsterDamage(value) {
        this._monsterDamage = value;
    }

    get monsterLife() {
        return this._monsterLife;  
    }

    set monsterLife(value) {
        this._monsterLife = value;
    }

    get monsterLastHit() {
        return this._monsterLastHit;
    }

    set monsterLastHit(value) {
        this._monsterLastHit = value;
    }

    get monsterPosition() { 
        return this._position;
    }

    get monsterState() {
        return this._monsterState;
    }

    _LoadModel() {
        const loader = new FBXLoader();
        loader.setPath('./models/monster/');
        loader.load('monster.fbx', (fbx) => {
            fbx.scale.setScalar(0.06);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            fbx.position.set(0, 0, -140);
            fbx.rotation.y = 0;
            fbx.scale.set(0.13, 0.13, 0.13);

            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load('./models/monster/monster_texture.png');
            fbx.traverse(c => {
                if (c.isMesh) {
                    c.material.map = texture;
                }
            });
        
            this._target = fbx;
            this._params.scene.add(this._target);

            this._position = this._target.position;
            this._previousPosition = this._target.position;
            this._rotation = this._target.rotation; 
            this._velocity = new THREE.Vector3(0, 0, 0);  
        
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
            loader.setPath('./models/monster/');
            loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
            loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
            loader.load('roar.fbx', (a) => { _OnLoad('roar', a); });
            loader.load('attack.fbx', (a) => { _OnLoad('attack', a); });
            loader.load('death.fbx', (a) => { _OnLoad('death', a); });
        });

        const box_1 = new THREE.BoxGeometry(30, 50, 10);
        const mat_1 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: false,
        });
        const cube_1 = new THREE.Mesh(box_1, mat_1);
        cube_1.position.set(0, 25, -70);
        this._params.scene.add(cube_1);
        this._worldBoundingBoxes.push(cube_1);

        const insideTowers_box = new THREE.BoxGeometry(201, 50, 100);
        const insideTowers_mat = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: false,
        });
        this._insideTowers = new THREE.Mesh(insideTowers_box, insideTowers_mat);
        this._insideTowers.position.set(1, 25, -145);
        this._params.scene.add(this._insideTowers);
    }

    update(deltaTime) {
      if (!this._stateMachine._currentState) {
        return;
      }
      const box = new THREE.Box3().setFromObject(this._insideTowers);
      this._stateMachine.attackPlayer = box.containsPoint(this._playerPosition);
      this._stateMachine.playerDistance = this._playerPosition.distanceTo(this._position);
      this._stateMachine.monsterLife = this._monsterLife;
      this._stateMachine._currentState.Update(deltaTime);

      if(this._stateMachine._currentState.Name != 'death'){
        if(box.containsPoint(this._playerPosition)){
          this.attackPlayer();
        }
        else{
          this.moveMonsterRandomly(deltaTime);
        }
      }

      if(this._mixer) {
        this._mixer.update(deltaTime);
      }
    }


    moveMonsterRandomly(deltaTime) {
      if(this._stateMachine._currentState.Name === 'idle' && Date.now() - this._timeLastIdle > 5000) {
        this._velocity.set(Math.random()<0.5?1:-1*Math.random(), 0, Math.random()<0.5?1:-1*Math.random()).normalize().multiplyScalar(0.6);            
      }

      if(this._stateMachine._currentState.Name === 'walk'){

        for (const b of this._worldBoundingBoxes) {
          const box = new THREE.Box3().setFromObject(b);
          if(box.containsPoint(this._position)){
            this._velocity.set(-this._velocity.x, 0, -this._velocity.z).normalize().multiplyScalar(0.6);
            this._position = this._previousPosition;
            break;
          }
        }

        this._position.add(this._velocity);
        const angle = Math.atan2(this._velocity.x, this._velocity.z);
        this._rotation.y = angle;
      }
    }


    attackPlayer() {
      const distanceToPlayer = this._playerPosition.distanceTo(this._position);

      if(distanceToPlayer < this._monsterAttackRange.min){
        this._velocity.copy(this._playerPosition).sub(this._position).normalize().multiplyScalar(-0.6);
        this._position.add(this._velocity);
        const angle = Math.atan2(this._playerPosition.x - this._position.x, this._playerPosition.z - this._position.z);
        this._rotation.y = angle;
      }
      else if(distanceToPlayer > this._monsterAttackRange.max){
        this._velocity.copy(this._playerPosition).sub(this._position).normalize().multiplyScalar(0.6);
        this._position.add(this._velocity);
        const angle = Math.atan2(this._playerPosition.x - this._position.x, this._playerPosition.z - this._position.z);
        this._rotation.y = angle;
      }
      else{ 
        const angle = Math.atan2(this._playerPosition.x - this._position.x, this._playerPosition.z - this._position.z);
        this._rotation.y = angle;
      }


    }
}

class FiniteStateMachine {
    constructor() {
      this._states = {};
      this._currentState = null;
    }
  
    _AddState(name, type) {
      this._states[name] = type;
    }
  
    SetState(name) {
      const prevState = this._currentState;
      
      if (prevState) {
        if (prevState.Name == name) {
          return;
        }
        prevState.Exit();
      }
  
      const state = new this._states[name](this);
  
      this._currentState = state;
      state.Enter(prevState);
    }
  
    Update(timeElapsed) {
      if (this._currentState) {
        this._currentState.Update(timeElapsed);
      }
    }
};

class CharacterFSM extends FiniteStateMachine {
    constructor(animations, monsterAttackRange) {
      super();
      this._animations = animations;
      this._monsterAttackRange = monsterAttackRange;
      this._attackPlayer = false; 
      this._playerDistance = 100000;
      this._monsterLife = 100;
      this._timeLastIdle = 0;
      this._timeLastWalk = 0;
      this._timeLastAttack = 0;
      this._timeLastRoar = 0;
      this._Init();
    }
  
    _Init() {
        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
        this._AddState('roar', RoarState);
        this._AddState('attack', AttackState);
        this._AddState('death', DeathState);
    }

    get attackPlayer() {
        return this._attackPlayer;
    }

    set attackPlayer(value) {
        this._attackPlayer = value;
    }

    get playerDistance() {
        return this._playerDistance;
    }

    set playerDistance(value) {
        this._playerDistance = value;
    }

    get monsterLife() {
        return this._monsterLife;
    }

    set monsterLife(value) {
        this._monsterLife = value;
    }
};

class State {
    constructor(parent) {
      this._parent = parent;
    }
  
    Enter() {}
    Exit() {}
    Update() {}
};


class IdleState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'idle';
    }
  
    Enter(prevState) {
      const idleAction = this._parent._animations['idle'].action;
      if (prevState) {
        const prevAction = this._parent._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.5, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(timeElapsed) {
      if(this._parent._monsterLife <= 0){
        this._parent.SetState('death');
        this._parent._monsterState = 'death';
      }
      else{
        if(this._parent._attackPlayer){
          if(this._parent._playerDistance < this._parent._monsterAttackRange.min || this._parent._playerDistance > this._parent._monsterAttackRange.max){
            this._parent._timeLastWalk = Date.now();  
            this._parent.SetState('walk');
            this._parent._monsterState = 'walk';
          }
          else{
            this._parent._timeLastAttack = Date.now();
            this._parent.SetState('attack');
            this._parent._monsterState = 'attack';
          }
        }
        else{
          if(Date.now() - this._parent._timeLastIdle > 5000){
            this._parent._timeLastWalk = Date.now();
            this._parent.SetState('walk');  
            this._parent._monsterState = 'walk';
          }
          else{
            this._parent.SetState('idle');
            this._parent._monsterState = 'idle';
          }
        }
      }
    }
};

class WalkState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'walk';
    }
  
    Enter(prevState) {
      const curAction = this._parent._animations['walk'].action;
      if (prevState) {
        const prevAction = this._parent._animations[prevState.Name].action;
  
        curAction.enabled = true;
  
        if (prevState.Name == 'idle') {
          const ratio = curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        } else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }
  
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(timeElapsed) {  
      if(this._parent._monsterLife <= 0){
        this._parent.SetState('death');
        this._parent._monsterState = 'death';
      }
      else{
        if(this._parent._attackPlayer){
          if(this._parent._playerDistance < this._parent._monsterAttackRange.min || this._parent._playerDistance > this._parent._monsterAttackRange.max){
            this._parent._timeLastWalk = Date.now();
            this._parent.SetState('walk');
            this._parent._monsterState = 'walk';
          }
          else{
            this._parent._timeLastAttack = Date.now();
            this._parent.SetState('attack');
            this._parent._monsterState = 'attack';
          }
        }
        else{
          if(Date.now() - this._parent._timeLastWalk > 5000){
            this._parent._timeLastIdle = Date.now();
            this._parent.SetState('idle');
            this._parent._monsterState = 'idle';
          }
          else{
            this._parent.SetState('walk');
            this._parent._monsterState = 'walk';
          }
        }
      }
    }
};


class RoarState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'roar';
  }

  Enter(prevState) {
    const curAction = this._parent._animations['roar'].action;
    if (prevState) {
      const prevAction = this._parent._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'idle') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed) {  
    if(this._parent._monsterLife <= 0){
      this._parent.SetState('death');
      this._parent._monsterState = 'death';
    }
    else{
      if(this._parent._attackPlayer){
        if(Date.now() - this._parent._timeLastRoar > 2500){
          if(this._parent._playerDistance < this._parent._monsterAttackRange.min || this._parent._playerDistance > this._parent._monsterAttackRange.max){
            this._parent._timeLastWalk = Date.now();
            this._parent.SetState('walk');
            this._parent._monsterState = 'walk';
          }
          else{
            this._parent._timeLastAttack = Date.now();
            this._parent.SetState('attack');
            this._parent._monsterState = 'attack';
          }
        }
        else{
          this._parent.SetState('roar');
          this._parent._monsterState = 'roar';
        }
      }
      else{
        this._parent._timeLastIdle = Date.now();
        this._parent.SetState('idle');
        this._parent._monsterState = 'idle';
      }
    }
  }
};


class AttackState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'attack';
  }

  Enter(prevState) {
    const curAction = this._parent._animations['attack'].action;
    if (prevState) {
      const prevAction = this._parent._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'idle') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed) {  
    if(this._parent._monsterLife <= 0){
      this._parent.SetState('death');
      this._parent._monsterState = 'death';
    }
    else{
      if(this._parent._attackPlayer){
        if(Date.now() - this._parent._timeLastAttack > 2500){
          this._parent._timeLastRoar = Date.now();
          this._parent.SetState('roar');
          this._parent._monsterState = 'roar';
        }
        else{          
          if(this._parent._playerDistance < this._parent._monsterAttackRange.min || this._parent._playerDistance > this._parent._monsterAttackRange.max){
            this._parent._timeLastWalk = Date.now();
            this._parent.SetState('walk');
            this._parent._monsterState = 'walk';
          }
          else{
            this._parent.SetState('attack');
            this._parent._monsterState = 'attack';
          }
        }
      }
      else{
        this._parent._timeLastIdle = Date.now();
        this._parent.SetState('idle');
        this._parent._monsterState = 'idle';
      }
    }
  }
};


class DeathState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'death';
  }

  Enter(prevState) {
    const curAction = this._parent._animations['death'].action;
    if (prevState) {
      const prevAction = this._parent._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'idle') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed) { 
    if(this._parent._monsterLife <= 0){
      this._parent.SetState('death');
      this._parent._monsterState = 'death';
    }  
  }
}