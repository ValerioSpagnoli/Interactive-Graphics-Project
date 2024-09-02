import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { World } from './world';
import { GUI } from './gui';
import { BasicCharacterController } from './characterControls';
import { ThirdPersonCamera } from './thirdPersonCamera';
import { StarsSpawner } from './starsSpawner';
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
        this._LoadAnimatedModel();
        this._LoadMobs();
        this._RAF();

        this._currentCollectedStars = 0;
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
        N: 100,
      });   
    }

    _LoadMobs() {
      this._mobSpawner = new MobSpawner({
        scene: this._scene,
        world: this._world,
        playerPosition: new THREE.Vector3(0, 0, 0),
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
      if (this._mixers) {
        this._mixers.map(m => m.update(timeElapsedS));
      }
  
      //* Update character controls
      if (this._controls) this._controls.Update(timeElapsedS);

      //* Update stars position
      if (this._starsSpawner) {
        this._starsSpawner.Update(timeElapsedS);
      }
      
      //* Update mobs position
      if (this._mobSpawner) {
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

      //* Handle star collection
      this._stars = this._starsSpawner.stars;
      this._characterPosition = this._controls.Position;
      this._stars.map(s => {
        if (s.position.distanceTo(this._characterPosition) < 8) {
          this._scene.remove(s);
          this._stars = this._stars.filter(star => star !== s);
          this._starsSpawner.stars = this._stars;
          this._currentCollectedStars += 1;
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

      //* Update GUI
      this._gui.updateKeys(this._controls.keyPressed);
      if(this._currentCollectedStars === 2){
        this._gui._powerBar.addSword();
        this._currentCollectedStars = 0;
      }
    }
}

let _APP = null;
window.addEventListener('DOMContentLoaded', () => { _APP = new Scene(); });