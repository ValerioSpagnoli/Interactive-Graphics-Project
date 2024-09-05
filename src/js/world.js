import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class World {
    constructor(params) {
        this._params = params;
        this._Init();
    }
    
    _Init() {
        this._boundingBoxes = [];
        this._boundingBoxesVisible = false;
        this._AddFloor();
        this._AddSky();
        this._AddModel();
        this._AddLights();
        this._AddBoundingBoxes();
    }

    _AddFloor() {
        const textureLoader = new THREE.TextureLoader();
        const floorTexture = textureLoader.load('./textures/gray_rocks_floor.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(15, 15);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(600, 600, 10, 10),
            new THREE.MeshStandardMaterial({
                map: floorTexture,
            }));
        floor.castShadow = false;
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;
        this._params.scene.add(floor);
    }

    _AddSky() {
        const textureLoader = new THREE.TextureLoader();
        const skyTexture = textureLoader.load('./textures/sky.jpg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
        });
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);

        const skyMaterial = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide,
            color: 0x333333
        });

        const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
        this._params.scene.add(skySphere);
    }

    _AddModel() {
        const loader = new GLTFLoader();
        loader.load('./models/scene_objects/scene.glb', (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
            });
            gltf.scene.position.set(1, 1, 1);
            gltf.scene.scale.set(20, 20, 20);
            this._params.scene.add(gltf.scene);
        });
    }

    _AddLights(){
        let light_1 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light_1.position.set(100, 100, 0);
        light_1.target.position.set(0, 0, 0);
        light_1.castShadow = true;
        light_1.shadow.bias = -0.001;
        light_1.shadow.mapSize.width = 4096;
        light_1.shadow.mapSize.height = 4096;
        light_1.shadow.camera.near = 0.1;
        light_1.shadow.camera.far = 500.0;
        light_1.shadow.camera.near = 0.5;
        light_1.shadow.camera.far = 500.0;
        light_1.shadow.camera.left = 50;
        light_1.shadow.camera.right = -50;
        light_1.shadow.camera.top = 50;
        light_1.shadow.camera.bottom = -50;
        this._params.scene.add(light_1);

        let light_2 = new THREE.DirectionalLight(0xd9c56c, 0.4);
        light_2.position.set(0, 100, 50);
        light_2.target.position.set(0, 0, 0);
        light_2.castShadow = true;
        light_2.shadow.bias = -0.001;
        light_2.shadow.mapSize.width = 4096;
        light_2.shadow.mapSize.height = 4096;
        light_2.shadow.camera.near = 0.1;
        light_2.shadow.camera.far = 500.0;
        light_2.shadow.camera.near = 0.5;
        light_2.shadow.camera.far = 500.0;
        light_2.shadow.camera.left = 50;
        light_2.shadow.camera.right = -50;
        light_2.shadow.camera.top = 50;
        light_2.shadow.camera.bottom = -50;
        this._params.scene.add(light_2);
    
        let light_3 = new THREE.AmbientLight(0xe8e0ba, 0.35);
        this._params.scene.add(light_3);
    }

    _AddBoundingBoxes() {
        //* Left tower
        const box_1 = new THREE.BoxGeometry(40, 50, 40);
        const mat_1 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_1 = new THREE.Mesh(box_1, mat_1);
        cube_1.position.set(-45, 25, 185);
        this._params.scene.add(cube_1);
        this._boundingBoxes.push(cube_1);

        //* Right tower
        const box_2 = new THREE.BoxGeometry(40, 50, 40);
        const mat_2 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_2 = new THREE.Mesh(box_2, mat_2);
        cube_2.position.set(45, 25, 185);
        this._params.scene.add(cube_2);
        this._boundingBoxes.push(cube_2);

        //* Left tower wall
        const box_3 = new THREE.BoxGeometry(130, 50, 20);
        const mat_3 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_3 = new THREE.Mesh(box_3, mat_3);
        cube_3.position.set(-120, 25, 200);
        this._params.scene.add(cube_3);
        this._boundingBoxes.push(cube_3);

        //* Right tower wall
        const box_4 = new THREE.BoxGeometry(130, 50, 20);
        const mat_4 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_4 = new THREE.Mesh(box_4, mat_4);
        cube_4.position.set(120, 25, 200);
        this._params.scene.add(cube_4);
        this._boundingBoxes.push(cube_4);

        //* Left side wall
        const box_5 = new THREE.BoxGeometry(20, 50, 400);
        const mat_5 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_5 = new THREE.Mesh(box_5, mat_5);
        cube_5.position.set(-180, 25, 0);
        this._params.scene.add(cube_5);
        this._boundingBoxes.push(cube_5);

        //* Left side wall
        const box_6 = new THREE.BoxGeometry(20, 50, 400);
        const mat_6 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_6 = new THREE.Mesh(box_6, mat_6);
        cube_6.position.set(180, 25, 0);
        this._params.scene.add(cube_6);
        this._boundingBoxes.push(cube_6);

        //* Bottom wall
        const box_7 = new THREE.BoxGeometry(400, 50, 20);
        const mat_7 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_7 = new THREE.Mesh(box_7, mat_7);
        cube_7.position.set(0, 25, -195);
        this._params.scene.add(cube_7);
        this._boundingBoxes.push(cube_7);

        //* Left wall tower inside
        const box_8 = new THREE.BoxGeometry(95, 50, 40);
        const mat_8 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_8 = new THREE.Mesh(box_8, mat_8);
        cube_8.position.set(-60, 25, -80);
        this._params.scene.add(cube_8);
        this._boundingBoxes.push(cube_8);

        //* Right wall tower inside
        const box_9 = new THREE.BoxGeometry(92, 50, 40);
        const mat_9 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_9 = new THREE.Mesh(box_9, mat_9);
        cube_9.position.set(60, 25, -80);
        this._params.scene.add(cube_9);
        this._boundingBoxes.push(cube_9);

        //* Left side wall tower inside
        const box_10 = new THREE.BoxGeometry(20, 50, 130);
        const mat_10 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_10 = new THREE.Mesh(box_10, mat_10);
        cube_10.position.set(-100, 25, -120);
        this._params.scene.add(cube_10);
        this._boundingBoxes.push(cube_10);

        //* Right side wall tower inside
        const box_11 = new THREE.BoxGeometry(20, 50, 130);
        const mat_11 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_11 = new THREE.Mesh(box_11, mat_11);
        cube_11.position.set(100, 25, -120);
        this._params.scene.add(cube_11);
        this._boundingBoxes.push(cube_11);

        //* Side tower
        const box_12 = new THREE.BoxGeometry(90, 50, 90);
        const mat_12 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_12 = new THREE.Mesh(box_12, mat_12);
        cube_12.position.set(180, 25, 0);
        this._params.scene.add(cube_12);
        this._boundingBoxes.push(cube_12);

        //* Inside small tower 1
        const box_13 = new THREE.BoxGeometry(30, 50, 40);
        const mat_13 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_13 = new THREE.Mesh(box_13, mat_13);
        cube_13.position.set(-80, 25, 5);
        this._params.scene.add(cube_13);
        this._boundingBoxes.push(cube_13);

        //* Inside small tower 2
        const box_14 = new THREE.BoxGeometry(30, 50, 40);
        const mat_14 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_14 = new THREE.Mesh(box_14, mat_14);
        cube_14.position.set(-60, 25, 95);
        this._params.scene.add(cube_14);
        this._boundingBoxes.push(cube_14);

        //* Inside small tower 3
        const box_15 = new THREE.BoxGeometry(40, 50, 35);
        const mat_15 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_15 = new THREE.Mesh(box_15, mat_15);
        cube_15.position.set(77, 25, 58);
        this._params.scene.add(cube_15);
        this._boundingBoxes.push(cube_15);

        //* Rocks 1
        const box_16 = new THREE.BoxGeometry(60, 50, 60);
        const mat_16 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_16 = new THREE.Mesh(box_16, mat_16);
        cube_16.position.set(-160, 25, 175);
        this._params.scene.add(cube_16);
        this._boundingBoxes.push(cube_16);

        //* Rocks 2
        const box_17 = new THREE.BoxGeometry(30, 50, 30);
        const mat_17 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_17 = new THREE.Mesh(box_17, mat_17);
        cube_17.position.set(-170, 25, 45);
        this._params.scene.add(cube_17);
        this._boundingBoxes.push(cube_17);

        //* Rocks 3
        const box_18 = new THREE.BoxGeometry(30, 50, 30);
        const mat_18 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_18 = new THREE.Mesh(box_18, mat_18);
        cube_18.position.set(-170, 25, -180);
        this._params.scene.add(cube_18);
        this._boundingBoxes.push(cube_18);

        //* Rocks 4
        const box_19 = new THREE.BoxGeometry(30, 50, 30);
        const mat_19 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_19 = new THREE.Mesh(box_19, mat_19);
        cube_19.position.set(-110, 25, -180);
        this._params.scene.add(cube_19);
        this._boundingBoxes.push(cube_19);

        //* Rocks 5
        const box_20 = new THREE.BoxGeometry(30, 50, 30);
        const mat_20 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_20 = new THREE.Mesh(box_20, mat_20);
        cube_20.position.set(-105, 25, -70);
        this._params.scene.add(cube_20);
        this._boundingBoxes.push(cube_20);

        //* Rocks 6
        const box_21 = new THREE.BoxGeometry(30, 50, 30);
        const mat_21 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_21 = new THREE.Mesh(box_21, mat_21);
        cube_21.position.set(-95, 25, -50);
        this._params.scene.add(cube_21);
        this._boundingBoxes.push(cube_21);

        //* Rocks 7
        const box_22 = new THREE.BoxGeometry(60, 50, 50);
        const mat_22 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_22 = new THREE.Mesh(box_22, mat_22);
        cube_22.position.set(170, 25, -170);
        this._params.scene.add(cube_22);
        this._boundingBoxes.push(cube_22);

        //* Rocks 7
        const box_23 = new THREE.BoxGeometry(40, 50, 50);
        const mat_23 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_23 = new THREE.Mesh(box_23, mat_23);
        cube_23.position.set(170, 25, 70);
        this._params.scene.add(cube_23);
        this._boundingBoxes.push(cube_23);

        //* Rocks 8
        const box_24 = new THREE.BoxGeometry(40, 50, 30);
        const mat_24 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_24 = new THREE.Mesh(box_24, mat_24);
        cube_24.position.set(170, 25, 180);
        this._params.scene.add(cube_24);
        this._boundingBoxes.push(cube_24);

        //* Limit top
        const box_25 = new THREE.BoxGeometry(480, 50, 10);
        const mat_25 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_25 = new THREE.Mesh(box_25, mat_25);
        cube_25.position.set(0, 25, 240);
        this._params.scene.add(cube_25);
        this._boundingBoxes.push(cube_25);

        //* Limit bottom
        const box_26 = new THREE.BoxGeometry(480, 50, 10);
        const mat_26 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_26 = new THREE.Mesh(box_26, mat_26);
        cube_26.position.set(0, 25, -240);
        this._params.scene.add(cube_26);
        this._boundingBoxes.push(cube_26);

        //* Limit left
        const box_27 = new THREE.BoxGeometry(10, 50, 480);
        const mat_27 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_27 = new THREE.Mesh(box_27, mat_27);
        cube_27.position.set(-240, 25, 0);
        this._params.scene.add(cube_27);
        this._boundingBoxes.push(cube_27);

        //* Limit right
        const box_28 = new THREE.BoxGeometry(10, 50, 480);
        const mat_28 = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            visible: this._boundingBoxesVisible,
        });
        const cube_28 = new THREE.Mesh(box_28, mat_28);
        cube_28.position.set(240, 25, 0);
        this._params.scene.add(cube_28);
        this._boundingBoxes.push(cube_28);


    }

    get BoundingBoxes() {
        return this._boundingBoxes;
    }
}