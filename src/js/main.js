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
        //this._camera.position.set(25, 15, 25);
        this._camera.position.set(200, 300, 200);
    
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
        this._LoadAnimatedModel();
        this._LoadMobs();
        this._RAF();

        this._currentCollectedStars = 0;
        this._currentHitFromMobs = 0;
        this._lastAttackTime = 0; 
        this._gameOver = false;
    }
  
    _LoadWorld(){
        this._world = new World({
            scene: this._scene,
        });
    }

    _LoadGUI(){
        this._gui = new GUI();
    }

    _LoadAnimatedModel() {
      const params = {
        camera: this._camera,
        scene: this._scene,
      }
      this._controls = new BasicCharacterController(params);
  
      this._thirdPersonCamera = new ThirdPersonCamera({
        camera: this._camera,
        target: this._controls,
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
        playerPosition: this._controls.Position,
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

      //* Update mixers
      if (this._mixers && !this._gameOver) {
        this._mixers.map(m => m.update(timeElapsedS));
      }
  
      //* Update character controls
      if (this._controls && !this._gameOver) {
        this._controls.Update(timeElapsedS);
      }

      //* Update stars 
      if (this._starsSpawner && !this._gameOver) {
        this._starsSpawner.Update(timeElapsedS);
      }
      
      //* Update hearts 
      if (this._heartSpawner && !this._gameOver) {
        this._heartSpawner.Update(timeElapsedS);
      }

      //* Update swords 
      if (this._swordSpawner && !this._gameOver) {
        this._swordSpawner.Update(timeElapsedS);
      }

      //* Update mobs 
      if (this._mobSpawner && !this._gameOver) {
        this._mobSpawner.update(timeElapsedS);
      }

      //* Switch between orbit controls and third person camera
      const lastTimeFPressed = this._controls._lastTimeFPressed;
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastTimeFPressed;
      if (this._controls._input._keys.f && timeDiff > 500) {
        this._orbitControls.enabled = !this._orbitControls.enabled;
        this._controls._lastTimeFPressed = currentTime

        if (this._orbitControls.enabled) {
          this._orbitControls.target = this._thirdPersonCamera._params.target.Position;
          this._orbitControls.object.position.copy(this._thirdPersonCamera._currentPosition);
          this._orbitControls.object.lookAt(this._controls.Position);
        }
      }
      if(this._orbitControls.enabled) this._orbitControls.update();
      else this._thirdPersonCamera.Update(timeElapsedS);

      //* Handle game over
      if (this._gui._healthBar.hearts.length === 0) {
        this._gameOver = true;
        this._gui._gameOver.show();
      }


      //* Handle star collection
      this._stars = this._starsSpawner.stars;
      this._characterPosition = this._controls.Position;
      this._stars.map(s => {
        if (s.position.distanceTo(this._characterPosition) < 8) {
          this._scene.remove(s);
          this._stars = this._stars.filter(star => star !== s);
          this._starsSpawner.stars = this._stars;
          this._gui._starCounter.addStar();
        }
      });

      //* Handle heart collection
      this._hearts = this._heartSpawner.hearts;
      this._characterPosition = this._controls.Position;
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
      this._characterPosition = this._controls.Position;
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
      this._characterPosition = this._controls.Position;
      this._characterPreviousPosition = this._controls.PreviousPosition;
      this._worldboundingBoxes.map(b => {
        const box = new THREE.Box3().setFromObject(b);
        if (box.containsPoint(this._characterPosition)) {
          this._controls._velocity = new THREE.Vector3(0, 0, 0);
          this._controls._target.position.set(this._characterPreviousPosition.x, this._characterPreviousPosition.y, this._characterPreviousPosition.z);
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
      if(this._currentHitFromMobs === 5){
        this._gui._healthBar.removeHeart();
        this._currentHitFromMobs = 0;
      }

      //* Handle attacks on mobs
      const damage = Math.ceil(this._gui._powerBar.swords.length / 2);
      if (this._controls._stateMachine._currentState && this._controls._stateMachine._currentState.Name === 'attack' && (Date.now() - this._lastAttackTime) > 1000) {
        for (const mob of this._mobs) {
          const distanceToPlayer = this._characterPosition.distanceTo(mob.position);
          if (distanceToPlayer < 10 && !mob.deadFlag) {
            mob.life -= damage;
            this._lastAttackTime = new Date().getTime();
            console.log(mob.life);
          }
        }
      }
    }
}

let _APP = null;
window.addEventListener('DOMContentLoaded', () => { _APP = new Scene(); });