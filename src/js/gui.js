class HealthBar {
    constructor() {
        this._hearts = [];
        this._heartsContainer = document.createElement('div');
        this._heartsContainer.style.position = 'absolute';
        this._heartsContainer.style.left = '50%';
        this._heartsContainer.style.bottom = '10px';
        this._heartsContainer.style.transform = 'translateX(-50%)';
        document.body.appendChild(this._heartsContainer);

        for (let i = 0; i < 10; i++) {
            const heart = document.createElement('img');
            heart.src = './textures/heart.png';
            heart.style.width = '60px';
            heart.style.height = '60px';
            heart.style.margin = '0 4px';
            this._heartsContainer.appendChild(heart);
            this._hearts.push(heart);
        }
    }

    get hearts() {
        return this._hearts;
    }

    removeHeart() {
        if (this._hearts.length > 0) {
            const heart = this._hearts.pop();
            this._heartsContainer.removeChild(heart);
        }
    }

    addHeart() {
        if (this._hearts.length < 10) {
            const heart = document.createElement('img');
            heart.src = './textures/heart.png';
            heart.style.width = '60px';
            heart.style.height = '60px';
            heart.style.margin = '0 4px';
            this._heartsContainer.appendChild(heart);
            this._hearts.push(heart);
        }
    }

    show() {
        this._heartsContainer.style.display = 'block';
    }

    hide() {
        this._heartsContainer.style.display = 'none';
    }
}

class PowerBar {
    constructor() {
        this._swords = [];
        this._swordsContainer = document.createElement('div');
        this._swordsContainer.style.position = 'absolute';
        this._swordsContainer.style.left = '50%';
        this._swordsContainer.style.bottom = '70px';
        this._swordsContainer.style.transform = 'translateX(-50%)';
        document.body.appendChild(this._swordsContainer);

        for (let i = 0; i < 1; i++) {
            const heart = document.createElement('img');
            heart.src = './textures/sword.png';
            heart.style.width = '60px';
            heart.style.height = '60px';
            heart.style.margin = '0 4px';
            this._swordsContainer.appendChild(heart);
            this._swords.push(heart);
        }
    }

    get swords() {
        return this._swords;
    }

    removeSword() {
        if (this._swords.length > 0) {
            const sword = this._swords.pop();
            this._swordsContainer.removeChild(sword);
        }
    }

    addSword() {
        if (this._swords.length < 10) {
            const sword = document.createElement('img');
            sword.src = './textures/sword.png';
            sword.style.width = '60px';
            sword.style.height = '60px';
            sword.style.margin = '0 4px';
            this._swordsContainer.appendChild(sword);
            this._swords.push(sword);
        }
    }

    show() {
        this._swordsContainer.style.display = 'block';
    }

    hide() {
        this._swordsContainer.style.display = 'none';
    }
}

class StarCounter {
    constructor() {
        this._numOfStars = 0;
        this._starCounter = document.createElement('div');
        this._starCounter.style.position = 'absolute';
        this._starCounter.style.left = '100px';
        this._starCounter.style.top = '70px';
        this._starCounter.style.color = 'white';
        this._starCounter.style.fontSize = '70px';
        this._starCounter.style.fontFamily = 'Handjet';
        this._starCounter.innerHTML = `<img src="./textures/star.png" style="width: 60px; height: 60px; margin: 0 5px;"> ${this._numOfStars}`;
        document.body.appendChild(this._starCounter);
    }

    set stars(value) {
        this._numOfStars = value;
        this._starCounter.innerHTML = `<img src="./textures/star.png" style="width: 60px; height: 60px; margin: 0 4px;"> ${this._numOfStars}`;
    }

    get stars() {
        return this._numOfStars;
    }

    addStar() {
        this.stars = this.stars + 1
    }

    removeStar() {
        this.stars = this.stars - 1;
    }

    reset() {
        this.stars = 0;
    }

    show() {
        this._starCounter.style.display = 'block';
    }

    hide() {
        this._starCounter.style.display = 'none';
    }
}

class GameOver {
    constructor() {
        this._gameOver = document.createElement('div');
        this._gameOver.style.position = 'absolute';
        this._gameOver.style.left = '50%';
        this._gameOver.style.top = '40%';
        this._gameOver.style.transform = 'translate(-50%, -50%)';
        this._gameOver.style.color = 'white';
        this._gameOver.style.fontSize = '400px';
        this._gameOver.style.fontFamily = 'Handjet';
        this._gameOver.innerHTML = 'Game Over';

        this._layer = document.createElement('div');
        this._layer.style.position = 'absolute';
        this._layer.style.left = '0';
        this._layer.style.top = '0';
        this._layer.style.width = '100%';
        this._layer.style.height = '100%';
        this._layer.style.backgroundColor = 'rgba(30, 0, 0, 0.5)';
        this._layer.style.display = 'none';

        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '150%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.width = '400px';
        button.style.height = '180px';
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        button.style.fontSize = '100px';
        button.style.fontFamily = 'Handjet';
        button.innerHTML = 'Restart';
        button.onclick = () => {
            window.location.reload();
        }
        this._gameOver.appendChild(button);
        
        document.body.appendChild(this._layer);
        document.body.appendChild(this._gameOver);
    }

    show() {
        setTimeout(() => {
            this._gameOver.style.display = 'block';
            this._layer.style.display = 'block';
        }, 1000);
    }

    hide() {
        this._gameOver.style.display = 'none';
        this._layer.style.display = 'none';
    }
}

class GameWin {
    constructor() {
        this._gameWin = document.createElement('div');
        this._gameWin.style.position = 'absolute';
        this._gameWin.style.left = '50%';
        this._gameWin.style.top = '40%';
        this._gameWin.style.transform = 'translate(-50%, -50%)';
        this._gameWin.style.color = 'white';
        this._gameWin.style.fontSize = '400px';
        this._gameWin.style.fontFamily = 'Handjet';
        this._gameWin.innerHTML = 'Game Win';

        this._layer = document.createElement('div');
        this._layer.style.position = 'absolute';
        this._layer.style.left = '0';
        this._layer.style.top = '0';
        this._layer.style.width = '100%';
        this._layer.style.height = '100%';
        this._layer.style.backgroundColor = 'rgba(0, 30, 0, 0.5)';
        this._layer.style.display = 'none';

        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '150%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.width = '400px';
        button.style.height = '180px';
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        button.style.fontSize = '100px';
        button.style.fontFamily = 'Handjet';
        button.innerHTML = 'Restart';
        button.onclick = () => {
            window.location.reload();
        }
        this._gameWin.appendChild(button);

        document.body.appendChild(this._layer);
        document.body.appendChild(this._gameWin);
    }

    show() {
        setTimeout(() => {
            this._gameWin.style.display = 'block';
            this._layer.style.display = 'block';
        }, 1000);
    }

    hide() {
        this._gameWin.style.display = 'none';
        this._layer.style.display = 'none';
    }
}


class Start {
    constructor() {
        this._start = document.createElement('div');
        this._start.style.position = 'absolute';
        this._start.style.left = '50%';
        this._start.style.top = '40%';
        this._start.style.transform = 'translate(-50%, -50%)';
        this._start.style.color = 'white';
        this._start.style.fontSize = '300px';
        this._start.style.fontFamily = 'Handjet';
        this._start.innerHTML = 'Kill the Monster';

        this._layer = document.createElement('div');
        this._layer.style.position = 'absolute';
        this._layer.style.left = '0';
        this._layer.style.top = '0';
        this._layer.style.width = '100%';
        this._layer.style.height = '100%';
        this._layer.style.backgroundColor = 'rgba(100, 100, 100, 0.2)';
        this._layer.style.display = 'none';

        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '150%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.width = '400px';
        button.style.height = '180px';
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        button.style.fontSize = '100px';
        button.style.fontFamily = 'Handjet';
        button.innerHTML = 'Start';
        button.onclick = () => {
            this._play = true;
            this.hide();
        }
        this._start.appendChild(button);

        document.body.appendChild(this._layer);
        document.body.appendChild(this._start);

        this._play = false;
    }

    show() {
        setTimeout(() => {
            this._start.style.display = 'block';
            this._layer.style.display = 'block';
        }, 1000);
    }

    hide() {
        this._start.style.display = 'none';
        this._layer.style.display = 'none';
    }

    get play() {
        return this._play;
    }

    set play(value) {
        this._play = value;
    }
}

class MonsterLifeBar {
    constructor(){        
        this._monsterLife = 100;
        this._monsterLifeBar = document.createElement('div');
        this._monsterLifeBar.style.position = 'absolute';
        this._monsterLifeBar.style.left = '50%';
        this._monsterLifeBar.style.top = '90px';
        this._monsterLifeBar.style.transform = 'translateX(-50%)';
        this._monsterLifeBar.style.width = '1000px';
        this._monsterLifeBar.style.height = '50px';
        this._monsterLifeBar.style.border = 'solid 5px white';
        this._monsterLifeBar.style.borderRadius = '10px';
        document.body.appendChild(this._monsterLifeBar);

        this._divs = [];
        for(let i = 0; i < 100; i++){
            const life = document.createElement('div');
            life.style.width = '10px';
            life.style.height = '50px';
            life.style.backgroundColor = 'red';
            life.style.float = 'left';
            this._monsterLifeBar.appendChild(life);
            this._divs.push(life);
        }
    }

    get monsterLife(){
        return this._monsterLife;
    }

    set monsterLife(value){
        this._monsterLife = value;
    }
    
    show(){
        this._monsterLifeBar.style.display = 'block';
    }

    hide(){
        this._monsterLifeBar.style.display = 'none';
    }

    update(){
        if(this._monsterLife < 0){
            this._monsterLife = 0;
        }
        for(let i = 0; i < this._monsterLife; i++){
            this._divs[i].style.display = 'block';
        }
        for(let i = this._monsterLife; i < 100; i++){
            this._divs[i].style.display = 'none';
        }
    }
}

class TransformationTime {
    constructor(){
        this._time = 30;
        this._timer = document.createElement('div');
        this._timer.style.position = 'absolute';
        this._timer.style.right = '100px';
        this._timer.style.top = '70px';
        this._timer.style.color = 'white';
        this._timer.style.fontSize = '70px';
        this._timer.style.fontFamily = 'Handjet';
        this._timer.innerHTML = `${this._time} s`;
        document.body.appendChild(this._timer);
    }

    get time(){
        return this._time;
    }

    set time(value){
        this._time = value;
    }

    update(){
        this._timer.innerHTML = `${this._time} s`;
    }

    show(){
        this._timer.style.display = 'block';
    }

    hide(){
        this._timer.style.display = 'none';
    }

}


export class GUI {
    constructor(params) {
        this._params = params;

        this._healthBar = new HealthBar();
        this._healthBar.hide();
            
        this._powerBar = new PowerBar();
        this._powerBar.hide();

        this._starCounter = new StarCounter(); 
        this._starCounter.hide();

        this._monsterLifeBar = new MonsterLifeBar();
        this._monsterLifeBar.hide();

        this._transformationTime = new TransformationTime();
        this._transformationTime.hide();

        this._gameOver = new GameOver(); 
        this._gameOver.hide();

        this._gameWin = new GameWin();
        this._gameWin.hide();

        this._start = new Start();
        this._start.show();
    }

    get healthBar() {
        return this._healthBar;
    }

    get powerBar() {
        return this._powerBar;
    }

    get starCounter() {
        return this._starCounter;
    }

    get transformationTime(){
        return this._transformationTime;
    }

    get monsterLifeBar() {
        return this._monsterLifeBar;
    }

    get gameOver() {
        return this._gameOver;
    }

    get gameWin() {
        return this._gameWin;
    }

    get start() {
        return this._start;
    }
}