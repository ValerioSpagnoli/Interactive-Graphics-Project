import * as THREE from 'three';

import { World } from './world';
import { GUI } from './gui';
import { PlayerSpawner } from './playerSpawner';
import { ThirdPersonCamera } from './thirdPersonCamera';
import { StarsSpawner } from './starsSpawner';
import { HeartSpawner } from './heartSpawner';
import { SwordSpawner } from './swordSpawner';
import { MobSpawner } from './mobSpawner';
import { MonsterSpawner } from './monsterSpawner';
import { ParticleSpawner } from './particleSpwaner';


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
        this._camera.position.set(150, 200, 300);
        this._camera.lookAt(new THREE.Vector3(-44, 0, -100));
    
        this._scene = new THREE.Scene();

        this._mixers = [];
        this._previousRAF = null;
        
        this._currentCollectedStars = 0;
        this._currentHitFromMobs = 0;
        this._currentHitFromMonster = 0;
        this._lastAttackTime = 0; 

        this._gameOver = false;
        this._gameOverTime = 0;
        this._gameWin = false;
        this._gameWinTime = 0;
        this._blockGame = false;  
        this._blockGui = false; 

        this._difficulty = 'medium';
        this._mobAttackTime = {'easy': 1000, 'medium': 500, 'hard': 300};
        this._mobHitsToDamage = {'easy': 4, 'medium': 3, 'hard': 2};
        this._monsterAttackTime = {'easy': 1100, 'medium': 600, 'hard': 400};
        this._monsterHitsToDamage = {'easy': 2, 'medium': 1, 'hard': 1};
        this._monsterDamageNormal = {'easy': 2, 'medium': 2, 'hard': 3};
        this._monsterDamageTransformed = {'easy': 1, 'medium': 1, 'hard': 2};

        this._bloodSpawnerParams = {
          scene: this._scene,
          colors: [0x8a2019, 0x870e05, 0x5c0e08],
          radius: {baseRadius: 0.1, randomRadius: 0.1},
          opacity: {baseOpacity: 1, randomOpacity: 0},
          transparency: false,
          velocity: {baseVelocity: new THREE.Vector3(-0.05,-0.15,-0.05), randomVelocity: new THREE.Vector3(0.5,0.8,0.5), baseSign: new THREE.Vector3(1,-1,1), randomSign: new THREE.Vector3(true,false,true), update: false},
          expirationTime: {baseExpirationTime: 5000, randomExpirationTime: 2000},
          boxX: {baseMin: -100, baseMax: 100, randomMin: 0, randomMax: 0, blockAll: false, visible: true},
          boxY: {baseMin: 0.1, baseMax: 100, randomMin: 0, randomMax: 0, blockAll: true, visible: true},
          boxZ: {baseMin: -100, baseMax: 100, randomMin: 0, randomMax: 0, blockAll: false, visible: true},
        }
        this._bloodSpawner = new ParticleSpawner(this._bloodSpawnerParams);
      
        this._LoadWorld();
        this._LoadGUI();
        this._LoadStars();
        this._LoadHearts();
        this._LoadSwords();
        this._LoadPlayer();
        this._LoadMobs();
        this._LoadMonster();
        this._RAF();

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
        world: this._world,
        healthBar: this._gui._healthBar,
        powerBar: this._gui._powerBar,
        starCounter: this._gui._starCounter,
      }
      this._player = new PlayerSpawner(params);
  
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
        playerPosition: this._player.position,
        mobAttackTime: this._mobAttackTime[this._difficulty],
      });
    }

    _LoadMonster() {
      this._monsterSpawner = new MonsterSpawner({
        scene: this._scene,
        world: this._world,
        playerPosition: this._player.position,
        monsterAttackTime: this._monsterAttackTime[this._difficulty],
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

    _Update(timeElapsed) {
      //* Update mixers
      if (this._mixers && !this._blockGame) {
        this._mixers.map(m => m.update(timeElapsed));
      }
  
      //* Update character controls
      if (this._player && !this._blockGame) {
        this._player.Update(timeElapsed);
      }

      //* Update stars 
      if (this._starsSpawner && !this._blockGame) {
        this._starsSpawner.Update(timeElapsed);
      }
      
      //* Update hearts 
      if (this._heartSpawner && !this._blockGame) {
        this._heartSpawner.Update(timeElapsed);
      }

      //* Update swords 
      if (this._swordSpawner && !this._blockGame) {
        this._swordSpawner.Update(timeElapsed);
      }

      //* Update mobs 
      if (this._mobSpawner && !this._blockGame) {
        this._mobSpawner.update(timeElapsed);
      }

      //* Update monster
      if (this._monsterSpawner && !this._blockGame) {
        this._monsterSpawner.update(timeElapsed);
      }

      //* Update blood
      if (this._bloodSpawner && !this._blockGame) {
        this._bloodSpawner.update();
      }

      //* Update world
      if (this._world && !this._blockGame) {
        this._world.update(timeElapsed);
      }

      //* Update GUI
      if (this._gui && !this._blockGui) {
        if(!this._gui.start.play){
          this._blockGame = true;
        }
        else{
          if(this._blockGame) this._player.rotation = new THREE.Quaternion(0, 1, 0, 0);
          this._blockGame = false;
          this._gui.healthBar.show();
          this._gui.powerBar.show();
          this._gui.starCounter.show();
          this._gui.monsterLifeBar.show();
          this._gui.transformationTime.show();
        }

        this._gui.monsterLifeBar.update();
        this._gui.transformationTime.update(this._player.transformed);
        this._gui.start.update();
        this._difficulty = this._gui.start._difficulty;
        this._gui._monsterLifeBar.monsterLife = this._monsterSpawner.monsterLife;

        if(this._player.transformed) this._gui._transformationTime.time = Math.ceil((this._gui._transformationTime.time = this._player.transformationTime - (Date.now() - this._player.timeTransformed))/1000);
        else this._gui._transformationTime.time = Math.ceil(this._player.transformationTime/1000);
      }

      //* Update third person camera
      if(!this._blockGame) this._thirdPersonCamera.Update(timeElapsed);
    }

    _GameOverWinHandler(){
      //* Handle game over
      if (this._gui._healthBar.hearts.length === 0 && !this._gameOver) {
        this._gameOver = true;
        this._gameOverTime = new Date().getTime();
        this._gui._gameOver.show();
      }

      //* Handle game win
      if (this._monsterSpawner.monsterState === 'death' && !this._gameWin) {
        this._gameWin = true;
        this._gameWinTime = new Date().getTime();
        this._gui._gameWin.show();
      }

      if (((this._gameOver && (Date.now()-this._gameOverTime)>2000) || (this._gameWin && (Date.now()-this._gameWinTime)>2000))){
        this._blockGame = true;
        this._blockGui = true;
      }
    }

    _CollectorHandler(){
      //* Handle star collection
      if(!this._player.transformed){
        this._stars = this._starsSpawner.stars;
        this._playerPosition = this._player.position;
        this._stars.map(s => {
          if (s.position.distanceTo(this._playerPosition) < 8) {
            this._scene.remove(s);
            this._stars = this._stars.filter(star => star !== s);
            this._starsSpawner.stars = this._stars;
            this._gui._starCounter.addStar();
          }
        });
      }

      //* Handle heart collection
      this._hearts = this._heartSpawner.hearts;
      this._playerPosition = this._player.position;
      this._hearts.map(h => {
        if (h.position.distanceTo(this._playerPosition) < 8) {
          this._scene.remove(h);
          this._hearts = this._hearts.filter(heart => heart !== h);
          this._heartSpawner.hearts = this._hearts;
          this._gui._healthBar.addHeart();
        }
      });

      //* Handle sword collection
      this._swords = this._swordSpawner.swords;
      this._playerPosition = this._player.position;
      this._swords.map(s => {
        if (s.position.distanceTo(this._playerPosition) < 8) {
          this._scene.remove(s);
          this._swords = this._swords.filter(sword => sword !== s);
          this._swordSpawner.swords = this._swords;
          this._gui._powerBar.addSword();
        }
      });
    }

    _MobAttackHandler(){
      //* Handle mob attack
      this._mobs = this._mobSpawner.mobs;
      this._mobAttackDistance = this._mobSpawner.mobAttackDistance;
      this._mobAttackTime = this._mobSpawner.mobAttackTime;
      this._player.hitFlag = false; 
      for (const mob of this._mobs) {
        const distanceToPlayer = this._playerPosition.distanceTo(mob.position);
        if (distanceToPlayer < this._mobAttackDistance && (Date.now() - mob.lastHit) > this._mobAttackTime && !mob.deadFlag) {
          mob.lastHit = new Date().getTime();
          this._player.hitFlag = true;
          this._player.hitDirection = mob.position.clone().sub(this._playerPosition).normalize(); 
          if(this._player.transformed)this._player.hitIntensity = 0.3;
          else this._player.hitIntensity = 1;  
          this._currentHitFromMobs += 1;
        }
      }
      if(this._currentHitFromMobs === this._mobHitsToDamage[this._difficulty]){
        this._gui._healthBar.removeHeart();
        this._currentHitFromMobs = 0;
        this._bloodSpawner.create({x: this._player.position.x, y: this._player.position.y, z: this._player.position.z, width: 5, height: 5, depth: 5}, 30);
      }

      //* Handle attacks on mobs
      const damage = this._player.damage;
      if (this._player._stateMachine._currentState && (this._player._stateMachine._currentState.Name === 'attack_1' || this._player._stateMachine._currentState.Name === 'attack_2') && (Date.now() - this._lastAttackTime) > 1000) {
        for (const mob of this._mobs) {

          const distanceToPlayer = this._playerPosition.distanceTo(mob.position);

          const player2MobDir = mob.position.clone().sub(this._playerPosition).normalize();
          const playerDir = this._player.position.clone().sub(this._player.previousPosition).normalize();
          const dot = playerDir.dot(player2MobDir);
          const inFront = dot > 0.5;

          if (distanceToPlayer < this._player.attackRange && !mob.deadFlag && inFront) {
            mob.life -= damage;
            this._lastAttackTime = new Date().getTime();
            this._bloodSpawner.create({x: mob.position.x, y: mob.position.y, z: mob.position.z, width: 3, height: 3, depth: 3}, 10);
          }
        }
      }
    }

    _MonsterAttackHandler(){
      //* Handle monster attack
      if(this._player.transformed) this._monsterSpawner.monsterDamage = this._monsterDamageTransformed[this._difficulty];
      else this._monsterSpawner.monsterDamage = this._monsterDamageNormal[this._difficulty];
      this._monsterDamage = this._monsterSpawner.monsterDamage;
      this._monsterAttackRange = this._monsterSpawner.monsterAttackRange;
      this._monsterAttackTime = this._monsterSpawner.monsterAttackTime;
      this._monsterState = this._monsterSpawner.monsterState;
      const distanceToMonster = this._playerPosition.distanceTo(this._monsterSpawner.monsterPosition);
      if (distanceToMonster > this._monsterAttackRange.min && distanceToMonster < this._monsterAttackRange.max) {
        if ((Date.now() - this._monsterSpawner.monsterLastHit) > this._monsterAttackTime && this._monsterState === 'attack') {
          this._monsterSpawner.monsterLastHit = new Date().getTime();
          this._currentHitFromMonster += 1;
          this._player.hitFlag = true;
          this._player.hitDirection = this._monsterSpawner.monsterPosition.clone().sub(this._playerPosition).normalize();
          if(this._player.transformed)this._player.hitIntensity = 1;
          else this._player.hitIntensity = 3;  
        }
      } 
      if(this._currentHitFromMonster === this._monsterHitsToDamage[this._difficulty]){
        for (let i = 0; i < this._monsterDamage; i++) {
          this._gui._healthBar.removeHeart();
        }
        this._currentHitFromMonster = 0;

        this._bloodSpawner.create({x: this._player.position.x, y: this._player.position.y, z: this._player.position.z, width: 10, height: 10, depth: 10}, 100);
      }

      //* Handle attacks on monster
      if (this._player._stateMachine._currentState && (this._player._stateMachine._currentState.Name === 'attack_1' || this._player._stateMachine._currentState.Name === 'attack_2') && (Date.now() - this._lastAttackTime) > 1000) {
        if (distanceToMonster < this._player.attackRange) {
          this._monsterSpawner.monsterLife -= this._player.damage;
          this._lastAttackTime = new Date().getTime();
          this._bloodSpawner.create({x: this._monsterSpawner.monsterPosition.x, y: this._monsterSpawner.monsterPosition.y, z: this._monsterSpawner.monsterPosition.z, width: 10, height: 10, depth: 10}, 100);
        }
      }
    }
  
    _Step(timeElapsed) {
      this._Update(timeElapsed * 0.001);
      if (this._blockGame) return;
      this._GameOverWinHandler();
      this._CollectorHandler();
      this._MobAttackHandler();
      this._MonsterAttackHandler();
    }
}

let _APP = null;
window.addEventListener('DOMContentLoaded', () => { _APP = new Scene(); });