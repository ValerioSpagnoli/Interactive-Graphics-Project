import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { World } from './world';
import { GUI } from './gui';
import { BasicCharacterController } from './characterControls';
import { ThirdPersonCamera } from './thirdPersonCamera';
import { StarsSpawner } from './starsSpawner';
import { HeartSpawner } from './heartSpawner';
import { SwordSpawner } from './swordSpawner';
import { MobSpawner } from './mobSpawner';
import { MonsterSpawner } from './monsterSpawner';


class Scene {
    constructor() {
      this._Initialize();
    }
  
    _Initialize() {
        this._threejs = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._threejs.outputEncoding = THREE.sRGBEncoding;
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    
        document.body.appendChild(this._threejs.domElement);
    
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
    
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        //this._camera.position.set(0, 0, 0);
        this._camera.position.set(0, 250, 300);
    
        this._scene = new THREE.Scene();
    
        this._orbitControls = new OrbitControls(this._camera, this._threejs.domElement);
        this._orbitControls.target.set(0, 0, 0);
        this._orbitControls.update();
        this._orbitControls.enabled = true;

        this._mixers = [];
        this._previousRAF = null;
        
        this._LoadWorld();
        this._LoadGUI();
        this._LoadStars();
        this._LoadHearts();
        this._LoadSwords();
        this._LoadPlayer();
        this._LoadMobs();
        this._LoadMonster();
        this._RAF();

        this._currentCollectedStars = 0;
        this._currentHitFromMobs = 0;
        this._lastAttackTime = 0; 

        this._gameOver = false;
        this._gameOverTime = 0;
        this._gameWin = false;
        this._gameWinTime = 0;
        this._blockGame = false;  
    }
  
    _LoadWorld(){
        this._world = new World({
            scene: this._scene,
        });
    }

    _LoadGUI(){
        this._gui = new GUI({
          player: this._player,
        });
    }

    _LoadPlayer() {
      const params = {
        camera: this._camera,
        scene: this._scene,
        healthBar: this._gui._healthBar,
        powerBar: this._gui._powerBar,
        starCounter: this._gui._starCounter,
      }
      this._player = new BasicCharacterController(params);
  
      this._thirdPersonCamera = new ThirdPersonCamera({
        camera: this._camera,
        target: this._player,
      });
    }
  
    _LoadStars() {
      this._starsSpawner = new StarsSpawner({
        scene: this._scene,
        world: this._world,
      });   
    }

    _LoadHearts() {
      this._heartSpawner = new HeartSpawner({
        scene: this._scene,
        world: this._world,
      });
    }

    _LoadSwords() { 
      this._swordSpawner = new SwordSpawner({
        scene: this._scene,
        world: this._world,
      });
    }

    _LoadMobs() {
      this._mobSpawner = new MobSpawner({
        scene: this._scene,
        world: this._world,
        playerPosition: this._player.Position,
      });
    }

    _LoadMonster() {
      this._monsterSpawner = new MonsterSpawner({
        scene: this._scene,
        world: this._world,
        playerPosition: this._player.Position,
      });
    }

    _OnWindowResize() {
      this._camera.aspect = window.innerWidth / window.innerHeight;
      this._camera.updateProjectionMatrix();
      this._threejs.setSize(window.innerWidth, window.innerHeight);
    }
  
    _RAF() {
      requestAnimationFrame((t) => {
        if (this._previousRAF === null) {
          this._previousRAF = t;
        }
  
        this._RAF();
  
        this._threejs.render(this._scene, this._camera);
        this._Step(t - this._previousRAF);
        this._previousRAF = t;
      });
    }
  
    _Step(timeElapsed) {
      const timeElapsedS = timeElapsed * 0.001;

      if(!this._gui.start.play){
        this._blockGame = true;
      }
      else{
        this._blockGame = false;
        this._orbitControls.enabled = false;
        this._gui.healthBar.show();
        this._gui.powerBar.show();
        this._gui.starCounter.show();
        this._gui.monsterLifeBar.show();
        this._gui.transformationTime.show();
      }

      if (((this._gameOver && (Date.now()-this._gameOverTime)>3000) || (this._gameWin && (Date.now()-this._gameWinTime)>3000))){
        this._blockGame = true;
      }
      
      //* Update mixers
      if (this._mixers && !this._blockGame) {
        this._mixers.map(m => m.update(timeElapsedS));
      }
  
      //* Update character controls
      if (this._player && !this._blockGame) {
        this._player.Update(timeElapsedS);
      }

      //* Update stars 
      if (this._starsSpawner && !this._blockGame) {
        this._starsSpawner.Update(timeElapsedS);
      }
      
      //* Update hearts 
      if (this._heartSpawner && !this._blockGame) {
        this._heartSpawner.Update(timeElapsedS);
      }

      //* Update swords 
      if (this._swordSpawner && !this._blockGame) {
        this._swordSpawner.Update(timeElapsedS);
      }

      //* Update mobs 
      if (this._mobSpawner && !this._blockGame) {
        this._mobSpawner.update(timeElapsedS);
      }

      //* Update monster
      if (this._monsterSpawner && !this._blockGame) {
        this._monsterSpawner.update(timeElapsedS);
      }

      //* Update GUI
      if (this._gui && !this._blockGame) {
        this._gui._monsterLifeBar.update();
        this._gui._transformationTime.update();
      }

      //* Switch between orbit controls and third person camera
      const lastTimeFPressed = this._player._lastTimeFPressed;
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastTimeFPressed;
      if (this._player._input._keys.f && timeDiff > 500) {
        this._orbitControls.enabled = !this._orbitControls.enabled;
        this._player._lastTimeFPressed = currentTime

        if (this._orbitControls.enabled) {
          this._orbitControls.target = this._thirdPersonCamera._params.target.Position;
          this._orbitControls.object.position.copy(this._thirdPersonCamera._currentPosition);
          this._orbitControls.object.lookAt(this._player.Position);
        }
      }
      if(this._orbitControls.enabled) this._orbitControls.update();
      else this._thirdPersonCamera.Update(timeElapsedS);

      //* Handle game over
      if (this._gui._healthBar.hearts.length === 0 && !this._gameOver) {
        this._gameOver = true;
        this._gameOverTime = new Date().getTime();
        this._gui._gameOver.show();
      }

      //* Handle game win
      if (this._monsterSpawner.MonsterState === 'death' && !this._gameWin) {
        this._gameWin = true;
        this._gameWinTime = new Date().getTime();
        this._gui._gameWin.show();
      }

      //* Handle star collection
      if(!this._player.transformed){
        this._stars = this._starsSpawner.stars;
        this._characterPosition = this._player.Position;
        this._stars.map(s => {
          if (s.position.distanceTo(this._characterPosition) < 8) {
            this._scene.remove(s);
            this._stars = this._stars.filter(star => star !== s);
            this._starsSpawner.stars = this._stars;
            this._gui._starCounter.addStar();
          }
        });
      }

      //* Handle heart collection
      this._hearts = this._heartSpawner.hearts;
      this._characterPosition = this._player.Position;
      this._hearts.map(h => {
        if (h.position.distanceTo(this._characterPosition) < 8) {
          this._scene.remove(h);
          this._hearts = this._hearts.filter(heart => heart !== h);
          this._heartSpawner.hearts = this._hearts;
          this._gui._healthBar.addHeart();
        }
      });

      //* Handle sword collection
      this._swords = this._swordSpawner.swords;
      this._characterPosition = this._player.Position;
      this._swords.map(s => {
        if (s.position.distanceTo(this._characterPosition) < 8) {
          this._scene.remove(s);
          this._swords = this._swords.filter(sword => sword !== s);
          this._swordSpawner.swords = this._swords;
          this._gui._powerBar.addSword();
        }
      });

      //* Handle collision with world bounding boxes
      this._worldboundingBoxes = this._world.BoundingBoxes;
      this._characterPosition = this._player.Position;
      this._characterPreviousPosition = this._player.PreviousPosition;
      this._worldboundingBoxes.map(b => {
        const box = new THREE.Box3().setFromObject(b);
        if (box.containsPoint(this._characterPosition)) {
          this._player._velocity = new THREE.Vector3(0, 0, 0);
          this._player._target.position.set(this._characterPreviousPosition.x, this._characterPreviousPosition.y, this._characterPreviousPosition.z);
        }
      });

      //* Handle mob attack
      this._mobs = this._mobSpawner.Mobs;
      this._mobAttackDistance = this._mobSpawner.MobAttackDistance;
      this._mobAttackTime = this._mobSpawner.MobAttackTime;
      for (const mob of this._mobs) {
        const distanceToPlayer = this._characterPosition.distanceTo(mob.position);
        if (distanceToPlayer < this._mobAttackDistance && (Date.now() - mob.lastHit) > this._mobAttackTime && !mob.deadFlag) {
          mob.lastHit = new Date().getTime();
          this._currentHitFromMobs += 1;
        }
      }
      if(this._currentHitFromMobs === 3){
        this._gui._healthBar.removeHeart();
        this._currentHitFromMobs = 0;
      }

      //* Handle attacks on mobs
      const damage = this._player.damage;
      if (this._player._stateMachine._currentState && this._player._stateMachine._currentState.Name === 'attack' && (Date.now() - this._lastAttackTime) > 1000) {
        for (const mob of this._mobs) {
          const distanceToPlayer = this._characterPosition.distanceTo(mob.position);
          if (distanceToPlayer < this._player.attackRange && !mob.deadFlag) {
            mob.life -= damage;
            this._lastAttackTime = new Date().getTime();
          }
        }
      }


      //* Handle monster attack
      if(this._player.transformed)this._monsterSpawner.MonsterDamage = 2;
      else this._monsterSpawner.MonsterDamage = 4;
      this._monsterDamage = this._monsterSpawner.MonsterDamage;
      this._monsterAttackRange = this._monsterSpawner.MonsterAttackRange;
      this._monsterAttackTime = this._monsterSpawner.MonsterAttackTime;
      this._monsterState = this._monsterSpawner.MonsterState;
      const distanceToMonster = this._characterPosition.distanceTo(this._monsterSpawner.MonsterPosition);
      if (distanceToMonster > this._monsterAttackRange.min && distanceToMonster < this._monsterAttackRange.max) {
        if ((Date.now() - this._monsterSpawner.MonsterLastHit) > this._monsterAttackTime && this._monsterState === 'attack') {
          this._monsterSpawner.MonsterLastHit = new Date().getTime();
          for (let i = 0; i < this._monsterDamage; i++) {
            this._gui._healthBar.removeHeart();
          }
        }
      } 

      //* Handle attacks on monster
      if (this._player._stateMachine._currentState && this._player._stateMachine._currentState.Name === 'attack' && (Date.now() - this._lastAttackTime) > 1000) {
        if (distanceToMonster < this._player.attackRange) {
          this._monsterSpawner.MonsterLife -= this._player.damage;
          this._lastAttackTime = new Date().getTime();
        }
      }

      //* Handle monster death
      this._gui._monsterLifeBar.monsterLife = this._monsterSpawner.MonsterLife;

      //* Handle transformation time
      if(this._player.transformed){
        this._gui._transformationTime.time = Math.ceil((this._gui._transformationTime.time = this._player.transformationTime - (Date.now() - this._player.timeTransformed))/1000);
      } 
      else{
        this._gui._transformationTime.time = Math.ceil(this._player.transformationTime/1000);
      } 
    }
}

let _APP = null;
window.addEventListener('DOMContentLoaded', () => { _APP = new Scene(); });