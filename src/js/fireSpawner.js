import * as THREE from 'three';

export class FireSpawner {
    constructor(params) {
        this._params = params;  
        this.scene = this._params.scene;
        this._fire = [];
    }
    
    createFire(area, amount) {
        let particles = [];
        for (let i = 0; i < amount; i++) {
            const position = new THREE.Vector3(area.x, area.y, area.z);
            const particle = new FireParticle(position);
            particle.mesh.position.set(
                area.x + Math.random() * area.width,
                area.y + Math.random() * area.height,
                area.z + Math.random() * area.depth
            );
            this.scene.add(particle.mesh);
            particles.push(particle);
        }
        this._fire.push({'particles': particles, 'time': Date.now()});
    }

    removeFire(particles) {
        particles.forEach((particle) => {
            this.scene.remove(particle.mesh);
        });
    }   
    
    updateFire() {
        for (let i = 0; i < this._fire.length; i++) {
            if (Date.now() - this._fire[i].time >= 1000) {
                this.removeFire(this._fire[i].particles);
                this._fire.splice(i, 1);
            }
            else{
                this._fire[i].particles.forEach((particle) => {
                    particle.update();
                });
            }
        }
    }
}

class FireParticle {
    constructor(position) {
        this._position = position;  
        this._colors = [0xed601f, 0xc7460a, 0xc7620a];
        this._mesh = new THREE.Mesh(
            new THREE.SphereGeometry(Math.random()*0.5 + 0.1, Math.random() * 1 + 5, Math.random() * 1 + 5),
            new THREE.MeshBasicMaterial({
                color: this._colors[Math.floor(Math.random() * this._colors.length)],
                opacity: Math.random() * 0.2 + 0.8,
                transparent: true,
            })
        );
        this._mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        this._velocity = new THREE.Vector3(0,0,0);
    }
    
    update() {
        if (this._mesh.position.y >= this._position.y+2+Math.random()*10) {
            this._mesh.position.y = this._position.y;
            this._mesh._velocity = new THREE.Vector3(0, 0, 0);
            this._mesh.visible = false;
        }
        else{
            this._velocity = new THREE.Vector3(
                Math.random()<0.5?0.1:-0.1, 
                Math.random() * 0.1 + 0.02, 
                Math.random()<0.5?0.1:-0.1
            );
            this._mesh.position.add(this._velocity);
        }
    }

    get mesh() {
        return this._mesh;
    }   
}