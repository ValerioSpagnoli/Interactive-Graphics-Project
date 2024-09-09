import * as THREE from 'three';

export class ParticleSpawner {
    constructor(params) {
        this._params = params;  
        this._scene = this._params.scene;
        this._particlesArray = [];
    }
    
    create(area, amount) {
        let particles = [];
        const position = new THREE.Vector3(area.x, area.y, area.z); 
        for (let i = 0; i < amount; i++) {
            const particle = new Particle(this._params, position);
            particle.mesh.position.set(
                area.x + Math.random() * area.width,
                area.y + Math.random() * area.height,
                area.z + Math.random() * area.depth
            );
            this._scene.add(particle.mesh);
            particles.push(particle);
        }
        this._particlesArray.push(particles);
    }
    
    update() {
        for (let i = 0; i < this._particlesArray.length; i++) {
            this._particlesArray[i].forEach((particle) => {
                if (Date.now() - particle.creationTime >= particle.expirationTime) {
                    particle.remove();
                    this._particlesArray[i].splice(this._particlesArray[i].indexOf(particle), 1);
                    if (this._particlesArray[i].length === 0) this._particlesArray.splice(i, 1);
                }
                else{
                    particle.update();
                }
            });
        }
    }
}

class Particle {
    constructor(params, position) {
        this._position = position;
        this._params = params;
        this._scene = this._params.scene;
        this._colors = this._params.colors;                 // array of colors
        this._radius = this._params.radius;                 // base radius, random radius
        this._opacity = this._params.opacity;               // base opacity, random opacity
        this._transparency = this._params.transparency;     // true or false
        this._velocityParams = this._params.velocity;       // base velocity, random velocity, base sign, random sign
        this._expirationTime = this._params.expirationTime; // base expiration time, random expiration time
        this._boxX = this._params.boxX;                     // baseMin, baseMax, randomMin, randomMax
        this._boxY = this._params.boxY;                     // baseMin, baseMax, randomMin, randomMax
        this._boxZ = this._params.boxZ;                     // baseMin, baseMax, randomMin, randomMax
        this._mesh = new THREE.Mesh(
          new THREE.SphereGeometry(Math.random()*this._radius.randomRadius + this._radius.baseRadius, Math.random() * 1 + 5, Math.random() * 1 + 5),
            new THREE.MeshBasicMaterial({
                color: this._colors[Math.floor(Math.random() * this._colors.length)],
                opacity: (this._transparency) ? Math.random() * this._opacity.randomOpacity + this._opacity.baseOpacity : this._opacity.baseOpacity,
                transparent: this._transparency,
            })
        );
        this._mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        this._velocity = new THREE.Vector3(
            this._velocityParams.baseSign.x * (this._velocityParams.randomSign.x ? (Math.random() < 0.5 ? -1 : 1) : 1) * Math.random() * this._velocityParams.randomVelocity.x + this._velocityParams.baseVelocity.x,
            this._velocityParams.baseSign.y * (this._velocityParams.randomSign.y ? (Math.random() < 0.5 ? -1 : 1) : 1) * Math.random() * this._velocityParams.randomVelocity.y + this._velocityParams.baseVelocity.y,
            this._velocityParams.baseSign.z * (this._velocityParams.randomSign.z ? (Math.random() < 0.5 ? -1 : 1) : 1) * Math.random() * this._velocityParams.randomVelocity.z + this._velocityParams.baseVelocity.z
        );

        this._creationTime = Date.now();
        this._expirationTime = this._expirationTime.baseExpirationTime + Math.random() * this._expirationTime.randomExpirationTime;
    }
    
    update() {
        if(this._velocityParams.update){
            this._velocity = new THREE.Vector3(
                this._velocityParams.baseSign.x * (this._velocityParams.randomSign.x ? (Math.random() < 0.5 ? -1 : 1) : 1) * Math.random() * this._velocityParams.randomVelocity.x + this._velocityParams.baseVelocity.x,
                this._velocityParams.baseSign.y * (this._velocityParams.randomSign.y ? (Math.random() < 0.5 ? -1 : 1) : 1) * Math.random() * this._velocityParams.randomVelocity.y + this._velocityParams.baseVelocity.y,
                this._velocityParams.baseSign.z * (this._velocityParams.randomSign.z ? (Math.random() < 0.5 ? -1 : 1) : 1) * Math.random() * this._velocityParams.randomVelocity.z + this._velocityParams.baseVelocity.z
            ); 
        }

        let xBound = false;
        let yBound = false;
        let zBound = false;

        if (this._mesh.position.x < this._position.x + (this._boxX.baseMin+Math.random()*this._boxX.randomMin) ||
            this._mesh.position.x > this._position.x + (this._boxX.baseMax+Math.random()*this._boxX.randomMax)){    
            xBound = true;
        }
        
        if (this._mesh.position.y < this._position.y + (this._boxY.baseMin+Math.random()*this._boxY.randomMin) ||
            this._mesh.position.y > this._position.y + (this._boxY.baseMax+Math.random()*this._boxY.randomMax)){
            yBound = true;
        }

        if (this._mesh.position.z < this._position.z + (this._boxZ.baseMin+Math.random()*this._boxZ.randomMin) ||
            this._mesh.position.z > this._position.z + (this._boxZ.baseMax+Math.random()*this._boxZ.randomMax)){
            zBound = true;
        }

        if((xBound && this._boxX.blockAll) ||
           (yBound && this._boxY.blockAll) ||
           (zBound && this._boxZ.blockAll)){
            this._velocity = new THREE.Vector3(0, 0, 0);
            this._mesh.visible = this._boxX.visible && this._boxY.visible && this._boxZ.visible;
        }
        else{
            this._velocity = new THREE.Vector3(
                xBound ? 0 : this._velocity.x,
                yBound ? 0 : this._velocity.y,
                zBound ? 0 : this._velocity.z
            );      
        }
        
        this._mesh.position.add(this._velocity);    
    }

    remove() {
        this._scene.remove(this._mesh);
    }

    get mesh() {
        return this._mesh;
    }

    get creationTime() {
        return this._creationTime;
    }

    get expirationTime() {
        return this._expirationTime;
    }
}