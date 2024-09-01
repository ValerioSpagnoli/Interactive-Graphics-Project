import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { BasicCharacterController } from './characterControls';
import { ThirdPersonCamera } from './thirdPersonCamera';
import { StarsSpawner } from './starsSpawner';


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
        this._camera.position.set(25, 15, 25);
    
        this._scene = new THREE.Scene();
    
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(-100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 50;
        light.shadow.camera.right = -50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        this._scene.add(light);
    
        light = new THREE.AmbientLight(0xFFFFFF, 0.25);
        this._scene.add(light);

        this._orbitControls = new OrbitControls(this._camera, this._threejs.domElement);
        this._orbitControls.target.set(0, 0, 0);
        this._orbitControls.update();
        this._orbitControls.enabled = false;

        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './textures/desert/posx.jpg',
            './textures/desert/negx.jpg',
            './textures/desert/posy.jpg',
            './textures/desert/negy.jpg',
            './textures/desert/posz.jpg',
            './textures/desert/negz.jpg',
        ]);
        texture.encoding = THREE.sRGBEncoding;
        this._scene.background = texture;
    
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);
    
        this._mixers = [];
        this._previousRAF = null;
    
        this._LoadStars();
        this._LoadAnimatedModel();
        this._RAF();


        // load the gltf model wall in scene_objects folder
        const loader2 = new GLTFLoader();
        loader2.load('./models/scene_objects/wall.glb', (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
            });
            gltf.scene.position.set(1, 1, 1);
            gltf.scene.scale.set(10, 10, 10);
            this._scene.add(gltf.scene);
        });
        loader2.load('./models/scene_objects/wall.glb', (gltf) => {
          gltf.scene.traverse(c => {
              c.castShadow = true;
          });
          gltf.scene.position.set(20, 1, 1);
          gltf.scene.scale.set(10, 10, 10);
          this._scene.add(gltf.scene);
      });
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
        }
      });

    }
}

let _APP = null;
window.addEventListener('DOMContentLoaded', () => { _APP = new Scene(); });