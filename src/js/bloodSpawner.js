import * as THREE from 'three';

export class BloodSpawner {
    constructor(params) {
        this._params = params;  
        this.scene = this._params.scene;
        this._blood = [];
    }
    
    createBlood(area, amount) {
        let particles = [];
        for (let i = 0; i < amount; i++) {
            const particle = new BloodParticle();
            particle.mesh.position.set(
                area.x + Math.random() * area.width,
                area.y + Math.random() * area.height,
                area.z + Math.random() * area.depth
            );
            this.scene.add(particle.mesh);
            particles.push(particle);
        }
        this._blood.push({'particles': particles, 'time': Date.now()});
    }

    removeBlood(particles) {
        particles.forEach((particle) => {
            this.scene.remove(particle.mesh);
        });
    }   
    
    updateBlood() {
        for (let i = 0; i < this._blood.length; i++) {
            if (Date.now() - this._blood[i].time >= 5000) {
                this.removeBlood(this._blood[i].particles);
                this._blood.splice(i, 1);
            }
            else{
                this._blood[i].particles.forEach((particle) => {
                    particle.update();
                });
            }
        }
    }
}

class BloodParticle {
    constructor() {
        this.colors = [0x8a2019, 0x870e05, 0x5c0e08];
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(Math.random() * 0.1 + 0.1, Math.random() * 1 + 5, Math.random() * 1 + 5),
            new THREE.MeshBasicMaterial({
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                opacity: 1,
                transparent: false,
            })
        );
        this.mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        this.velocity = new THREE.Vector3(
            (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.5 - 0.05,
            -Math.random() * 0.5 - 0.05,
            (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.5 - 0.05
        );
    }
    
    update() {
        if (this.mesh.position.y <= 0.1) {
            this.mesh.position.y = 0.1;
            this.mesh.velocity = new THREE.Vector3(0, 0, 0);
        }
        else{
            this.mesh.position.add(this.velocity);
        }
    }
}