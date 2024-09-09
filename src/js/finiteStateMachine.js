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
  
    Update(timeElapsed, input) {
      if (this._currentState) {
        this._currentState.Update(timeElapsed, input);
      }
    }
};


export class CharacterFSM extends FiniteStateMachine {
    constructor(animations) {
      super();
      this._animations = animations;
      this._playerLife = 10;
      this._Init();
    }
  
    _Init() {
      this._AddState('idle', IdleState);
      this._AddState('walk', WalkState);
      this._AddState('run', RunState);
      this._AddState('attack_1', AttackState_1);
      this._AddState('attack_2', AttackState_2);
      this._AddState('death', DeathState);
    }

    get playerLife() {
      return this._playerLife;
    }

    set playerLife(value) {
      this._playerLife = value;
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
  
    Update(timeElapsed, input) {
      if(this._parent.playerLife <= 0) {
        this._parent.SetState('death');
      }
      else{
        if (input._keys.forward || input._keys.backward) {
          this._parent.SetState('walk');
        } 
        else if (input._keys.space) {
          const randomAttack = Math.random() < 0.5 ? 'attack_1' : 'attack_2';
          this._parent.SetState(randomAttack);
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
  
        if (prevState.Name == 'run') {
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
  
    Update(timeElapsed, input) {
      if(this._parent.playerLife <= 0) {
        this._parent.SetState('death');
      }
      else{
        if (input._keys.forward || input._keys.backward) {
          if (input._keys.shift) {
            this._parent.SetState('run');
          }
          return;
        }
        else{
          this._parent.SetState('idle');
        }
      }
    }
};

class RunState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'run';
    }
  
    Enter(prevState) {
      const curAction = this._parent._animations['run'].action;
      if (prevState) {
        const prevAction = this._parent._animations[prevState.Name].action;
  
        curAction.enabled = true;
  
        if (prevState.Name == 'walk') {
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
  
    Update(timeElapsed, input) {
      if(this._parent.playerLife <= 0) {
        this._parent.SetState('death');
      }
      else{
        if (input._keys.forward || input._keys.backward) {
          if (!input._keys.shift) {
            this._parent.SetState('walk');
          }
          return;
        }
        else{
          this._parent.SetState('idle');
        }
      }
    }
};


class AttackState_1 extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'attack_1';
    }
  
    Enter(prevState) {
      const curAction = this._parent._animations['attack_1'].action;
      if (prevState) {
        const prevAction = this._parent._animations[prevState.Name].action;
  
        curAction.enabled = true;
  
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
  
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(timeElapsed, input) {
      if(this._parent.playerLife <= 0) {
        this._parent.SetState('death');
      }
      else{
        if (input._keys.space) {
          this._parent.SetState('attack_1');
        }
        else {
          this._parent.SetState('idle');
        }
      }
    }
}

class AttackState_2 extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'attack_2';
  }

  Enter(prevState) {
    const curAction = this._parent._animations['attack_2'].action;
    if (prevState) {
      const prevAction = this._parent._animations[prevState.Name].action;

      curAction.enabled = true;

      curAction.time = 0.0;
      curAction.setEffectiveTimeScale(1.0);
      curAction.setEffectiveWeight(1.0);

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if(this._parent.playerLife <= 0) {
      this._parent.SetState('death');
    }
    else{
      if (input._keys.space) {
        this._parent.SetState('attack_2');
      }
      else {
        this._parent.SetState('idle');
      }
    }
  }
}

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
  
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
  
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(timeElapsed, input) {
      this._parent.SetState('death');
    }
}