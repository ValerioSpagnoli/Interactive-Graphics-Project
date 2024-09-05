import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export class MonsterSpawner {

    constructor(params) {
        this._params = params;
        this._animations = {};
        this._stateMachine = new CharacterFSM(
            new BasicCharacterControllerProxy(this._animations)
        );
        this._velocity = new THREE.Vector3();  
        this._position = new THREE.Vector3();
        this._previousPosition = new THREE.Vector3();

        this._worldBoundingBoxes = [];
        for (const b of this._params.world.BoundingBoxes) {
            this._worldBoundingBoxes.push(b);
        }
        this._playerPosition = this._params.playerPosition;

        this._bossAttackDistance = 8;
        this._bossAttackTime = 800;        
        this._LoadModel();

        this._timeLastWalk = 0;
        this._timeLastIdle = 0;
    }

    get BossAttackDistance() {
        return this._bossAttackDistance;
    }

    get BossAttackTime() {
        return this._bossAttackTime;
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
            fbx.scale.set(0.17, 0.17, 0.17);

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
            loader.load('attack_1.fbx', (a) => { _OnLoad('attack_1', a); });
            loader.load('attack_2.fbx', (a) => { _OnLoad('attack_2', a); });
        });


        const box_1 = new THREE.BoxGeometry(60, 50, 40);
        const mat_1 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: true,
        });
        const cube_1 = new THREE.Mesh(box_1, mat_1);
        cube_1.position.set(0, 25, 185);
        this._params.scene.add(cube_1);
        this._worldBoundingBoxes.push(cube_1);

        const box_2 = new THREE.BoxGeometry(30, 50, 10);
        const mat_2 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: true,
        });
        const cube_2 = new THREE.Mesh(box_2, mat_2);
        cube_2.position.set(0, 25, -70);
        this._params.scene.add(cube_2);
        this._worldBoundingBoxes.push(cube_2);
    }

    update(deltaTime) {
      if (!this._stateMachine._currentState) {
        return;
      }
      this._stateMachine._currentState.Update(deltaTime);

      this.moveMonsterRandomly(deltaTime);
      if(this._stateMachine._currentState.Name == 'walk') {
      }

      if(this._mixer) {
        this._mixer.update(deltaTime);
      }
    }


    moveMonsterRandomly(deltaTime) {
      if(this._stateMachine._currentState.Name === 'idle' && Date.now() - this._timeLastIdle > 5000) {
        this._stateMachine.SetState('walk');
        this._timeLastWalk = Date.now();
        this._velocity.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
        this._velocity.normalize().multiplyScalar(0.2);
      }
      else if(this._stateMachine._currentState.Name === 'walk' && Date.now() - this._timeLastWalk > 5000) {
        this._stateMachine.SetState('idle');
        this._timeLastIdle = Date.now();
      }

      if(this._stateMachine._currentState.Name === 'walk'){

        for (const b of this._worldBoundingBoxes) {
          const box = new THREE.Box3().setFromObject(b);
          if(box.containsPoint(this._position)){
            this._velocity.set(-this._velocity.x, 0, -this._velocity.z);
            this._position = this._previousPosition;
            break;
          }
        }

        this._position.add(this._velocity);
        const angle = Math.atan2(this._velocity.x, this._velocity.z);
        this._rotation.y = angle;
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
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();
    }
  
    _Init() {
        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
        this._AddState('roar', RoarState);
        this._AddState('attack_1', Attack1State);
        this._AddState('attack_2', Attack2State);
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
      const idleAction = this._parent._proxy._animations['idle'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
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
      const curAction = this._parent._proxy._animations['walk'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
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
    const curAction = this._parent._proxy._animations['roar'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

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
  }
};


class Attack1State extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'attack_1';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['attack_1'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

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
  }
};

class Attack2State extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'attack_2';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['attack_2'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

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
  }
};