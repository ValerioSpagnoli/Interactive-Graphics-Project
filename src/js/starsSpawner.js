import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class StarsSpawner {
    constructor(params) {
        this._params = params;
        this._stars = [];
        this._LoadModels();
        this._goUp = true;
    }

    _LoadModels() {
        const loader = new GLTFLoader();

        for (let i = 0; i < this._params.N; i++) {
            loader.load('./models/scene_objects/star.glb', (gltf) => {
                gltf.scene.traverse(c => {
                    c.castShadow = true;
                });
                const star = gltf.scene;
                star.scale.set(3, 3, 3);
                star.position.set(Math.random()*500*getRandomSign(), 1, Math.random()*500*getRandomSign());
                this._params.scene.add(star);
                this._stars.push(star);
            });
        }
    }

    Update(timeInSeconds) {
        this._stars.map(s => {
            const rotationSpeed = 1;
            s.rotation.y += rotationSpeed * timeInSeconds;    
            
            const floatingSpeed = 2;

            if (this._goUp) {
                s.position.y += floatingSpeed * timeInSeconds;
            } else {
                s.position.y -= floatingSpeed * timeInSeconds;
            }

            if (s.position.y > 5) {
                this._goUp = false;
            } else if (s.position.y < 1) {
                this._goUp = true;
            }            
        });
    }
}

function getRandomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}