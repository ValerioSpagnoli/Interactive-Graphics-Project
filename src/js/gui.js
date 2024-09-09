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
            heart.style.width = '30px';
            heart.style.height = '30px';
            heart.style.margin = '0 2px';
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
            heart.style.width = '30px';
            heart.style.height = '30px';
            heart.style.margin = '0 2px';
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
        this._swordsContainer.style.bottom = '50px';
        this._swordsContainer.style.transform = 'translateX(-50%)';
        document.body.appendChild(this._swordsContainer);

        for (let i = 0; i < 1; i++) {
            const heart = document.createElement('img');
            heart.src = './textures/sword.png';
            heart.style.width = '30px';
            heart.style.height = '30px';
            heart.style.margin = '0 2px';
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
            sword.style.width = '30px';
            sword.style.height = '30px';
            sword.style.margin = '0 2px';
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
        this._starCounter.style.left = '50px';
        this._starCounter.style.top = '35px';
        this._starCounter.style.color = 'white';
        this._starCounter.style.fontSize = '35px';
        this._starCounter.style.fontFamily = 'Handjet';
        this._starCounter.innerHTML = `<img src="./textures/star.png" style="width: 30px; height: 30px; margin: 0 3px;"> ${this._numOfStars}`;
        document.body.appendChild(this._starCounter);
    }

    set stars(value) {
        this._numOfStars = value;
        this._starCounter.innerHTML = `<img src="./textures/star.png" style="width: 30px; height: 30px; margin: 0 3px;"> ${this._numOfStars}`;
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
        this._gameOver.style.fontSize = '150px';
        this._gameOver.style.fontFamily = 'Handjet';
        this._gameOver.innerHTML = 'Game Over';
        this._gameOver.style.textShadow = '3px 4px 3px rgba(255, 0, 0, 0.5)';


        this._layer = document.createElement('div');
        this._layer.style.position = 'absolute';
        this._layer.style.left = '0';
        this._layer.style.top = '0';
        this._layer.style.width = '100%';
        this._layer.style.height = '100%';
        this._layer.style.backgroundColor = 'rgba(100, 0, 0, 0.1)';
        this._layer.style.display = 'none';

        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '140%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.width = '200px';
        button.style.height = '90px';
        button.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
        button.style.color = 'rgba(255, 255, 255, 1)';
        button.style.textShadow = '3px 4px 3px rgba(155, 0, 0, 0.5)';
        button.style.fontSize = '50px';
        button.style.fontFamily = 'Handjet';
        button.style.border = 'solid 4px rgba(255, 0, 0, 0.5)';
        button.style.borderRadius = '10px';
        button.innerHTML = 'Restart';
        button.onclick = () => {
            window.location.reload();
        }
        button.onmouseover = () => {
            button.style.backgroundColor = 'rgba(180, 180, 180, 0.7)';
            button.style.border = 'solid 6px rgba(255, 0, 0, 0.5)';
        }
        button.onmouseout = () => {
            button.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            button.style.border = 'solid 4px rgba(255, 0, 0, 0.5)';

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
        this._gameWin.style.fontSize = '150px';
        this._gameWin.style.fontFamily = 'Handjet';
        this._gameWin.innerHTML = 'Game Win';
        this._gameWin.style.textShadow = '3px 4px 3px rgba(0, 255, 0, 0.5)';

        this._layer = document.createElement('div');
        this._layer.style.position = 'absolute';
        this._layer.style.left = '0';
        this._layer.style.top = '0';
        this._layer.style.width = '100%';
        this._layer.style.height = '100%';
        this._layer.style.backgroundColor = 'rgba(0, 100, 0, 0.1)';
        this._layer.style.display = 'none';

        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '140%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.width = '200px';
        button.style.height = '90px';
        button.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
        button.style.color = 'rgba(255, 255, 255, 1)';
        button.style.textShadow = '3px 4px 3px rgba(0, 155, 0, 0.5)';
        button.style.fontSize = '50px';
        button.style.fontFamily = 'Handjet';
        button.style.border = 'solid 4px rgba(0, 255, 0, 0.5)';
        button.style.borderRadius = '10px';
        button.innerHTML = 'Restart';
        button.onclick = () => {
            window.location.reload();
        }
        button.onmouseover = () => {
            button.style.backgroundColor = 'rgba(180, 180, 180, 0.7)';
            button.style.border = 'solid 6px rgba(0, 255, 0, 0.5)';
        }
        button.onmouseout = () => {
            button.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            button.style.border = 'solid 4px rgba(0, 255, 0, 0.5)';

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
        this._start.style.top = '25%';
        this._start.style.transform = 'translate(-50%, -50%)';
        this._start.style.color = 'white';
        this._start.style.fontSize = '150px';
        this._start.style.fontFamily = 'Handjet';
        this._start.innerHTML = 'Kill the Monster';
        this._start.style.textShadow = '3px 4px 3px rgba(0, 0, 155, 0.5)';

        this._layer = document.createElement('div');
        this._layer.style.position = 'absolute';
        this._layer.style.left = '0';
        this._layer.style.top = '0';
        this._layer.style.width = '100%';
        this._layer.style.height = '100%';
        this._layer.style.backgroundColor = 'rgba(0, 0, 155, 0.1)';
        this._layer.style.display = 'none';

        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '285%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.width = '200px';
        button.style.height = '90px';
        button.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
        button.style.color = 'rgba(255, 255, 255, 1)';
        button.style.textShadow = '3px 4px 3px rgba(0, 0, 155, 0.5)';
        button.style.fontSize = '50px';
        button.style.fontFamily = 'Handjet';
        button.style.border = 'solid 4px rgba(0, 0, 155, 0.5)';
        button.style.borderRadius = '10px';
        button.innerHTML = 'Start';
        button.onclick = () => {
            this._play = true;
            this.hide();
        }
        button.onmouseover = () => {
            button.style.backgroundColor = 'rgba(180, 180, 180, 0.7)';
            button.style.border = 'solid 6px rgba(0, 0, 155, 0.5)';
        }
        button.onmouseout = () => {
            button.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            button.style.border = 'solid 4px rgba(0, 0, 155, 0.5)';

        }
        this._start.appendChild(button);

        const difficulty = document.createElement('div');
        difficulty.style.position = 'absolute';
        difficulty.style.left = '50%';
        difficulty.style.top = '350%';
        difficulty.style.transform = 'translate(-50%, -50%)';
        difficulty.style.color = 'white';
        difficulty.style.fontSize = '35px';
        difficulty.style.fontFamily = 'Handjet';
        difficulty.innerHTML = 'Choose the difficulty';
        this._start.appendChild(difficulty);

        const easy = document.createElement('input');
        easy.type = 'radio';
        easy.name = 'difficulty';
        easy.value = 'easy';
        easy.checked = false;
        easy.style.width = '27px';
        easy.style.height = '27px';
        easy.style.margin = '40 40px';
        easy.style.position = 'absolute';
        easy.style.left = '29%';
        easy.style.top = '380%';
        easy.style.transform = 'translate(-50%, -50%)';   
        easy.style.appearance = 'none';
        easy.style.border = 'solid 1px rgba(0, 0, 155, 0.5)';
        easy.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
        easy.style.borderRadius = '7px';
        this._start.appendChild(easy);

        const easyLabel = document.createElement('label');
        easyLabel.innerHTML = 'Easy';
        easyLabel.style.color = 'white';
        easyLabel.style.fontSize = '30px';
        easyLabel.style.fontFamily = 'Handjet';
        easyLabel.style.position = 'absolute';
        easyLabel.style.left = '35%';
        easyLabel.style.top = '381%';
        easyLabel.style.transform = 'translate(-50%, -50%)';
        this._start.appendChild(easyLabel);

        const medium = document.createElement('input');
        medium.type = 'radio';
        medium.name = 'difficulty';
        medium.value = 'medium';
        medium.checked = true;  
        medium.style.width = '27px';
        medium.style.height = '27px';
        medium.style.margin = '40 40px';
        medium.style.position = 'absolute';
        medium.style.left = '44%';
        medium.style.top = '380%';
        medium.style.transform = 'translate(-50%, -50%)';
        medium.style.appearance = 'none';
        medium.style.border = 'solid 1px rgba(0, 0, 155, 0.5)';
        medium.style.backgroundColor = 'rgba(0, 0, 155, 0.5)';
        medium.style.borderRadius = '7px';
        this._start.appendChild(medium);

        const mediumLabel = document.createElement('label');
        mediumLabel.innerHTML = 'Medium';
        mediumLabel.style.color = 'white';
        mediumLabel.style.fontSize = '30px';
        mediumLabel.style.fontFamily = 'Handjet';
        mediumLabel.style.position = 'absolute';
        mediumLabel.style.left = '52%';
        mediumLabel.style.top = '381%';
        mediumLabel.style.transform = 'translate(-50%, -50%)';
        this._start.appendChild(mediumLabel);

        const hard = document.createElement('input');
        hard.type = 'radio';
        hard.name = 'difficulty';
        hard.value = 'hard';
        hard.checked = false;
        hard.style.width = '27px';
        hard.style.height = '27px';
        hard.style.margin = '40 40px';
        hard.style.position = 'absolute';
        hard.style.left = '62%';
        hard.style.top = '380%';
        hard.style.transform = 'translate(-50%, -50%)';
        hard.style.appearance = 'none';
        hard.style.border = 'solid 1px rgba(0, 0, 155, 0.5)';
        hard.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
        hard.style.borderRadius = '7px';
        this._start.appendChild(hard);

        const hardLabel = document.createElement('label');
        hardLabel.innerHTML = 'Hard';
        hardLabel.style.color = 'white';
        hardLabel.style.fontSize = '30px';
        hardLabel.style.fontFamily = 'Handjet';
        hardLabel.style.position = 'absolute';
        hardLabel.style.left = '68%';
        hardLabel.style.top = '381%';
        hardLabel.style.transform = 'translate(-50%, -50%)';
        this._start.appendChild(hardLabel);

        const explanation = document.createElement('div');
        explanation.style.position = 'absolute';
        explanation.style.left = '50%';
        explanation.style.top = '170%';
        explanation.style.width = '800px';
        explanation.style.transform = 'translate(-50%, -50%)';
        explanation.style.color = 'white';
        explanation.style.fontSize = '25px';
        explanation.style.fontFamily = 'Handjet';
        explanation.style.backgroundColor = 'rgba(180, 180, 180, 0.5)';
        explanation.style.border = 'solid 4px rgba(0, 0, 155, 0.5)';
        explanation.style.borderRadius = '10px';
        explanation.style.padding = '30px';
        explanation.innerHTML = '- <b>W A S D</b> to move, <b>Space</b> to attack and <b>Shift</b> to run.<br>- Collect swords to increase the power of your attack and hearts to increase your life.<br>- Collect <b>5 stars</b> to become bigger and stronger.<br>&nbsp&nbsp&nbspThe effect lasts for <b>15 seconds</b>, then you will return to normal size and lose 2 swords.<br>&nbsp&nbsp&nbspThe transformation will give to you full health.<br>- Defeat the monster to win the game.';
        this._start.appendChild(explanation);
        
        document.body.appendChild(this._layer);
        document.body.appendChild(this._start);

        this._play = false;
        this._difficulty = 'medium';
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

    update(){
        const easy = document.querySelector('input[value="easy"]');
        const medium = document.querySelector('input[value="medium"]');
        const hard = document.querySelector('input[value="hard"]');
        if(easy.checked){
            easy.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
            easy.style.border = 'solid 5px rgba(0, 0, 155, 0.8)';
            medium.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            medium.style.border = 'solid 3px rgba(0, 0, 155, 0.5)';
            hard.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            hard.style.border = 'solid 3px rgba(0, 0, 155, 0.5)';
        } else if(medium.checked){
            easy.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            easy.style.border = 'solid 3px rgba(0, 0, 155, 0.5)';
            medium.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
            medium.style.border = 'solid 5px rgba(0, 0, 155, 0.8)';
            hard.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            hard.style.border = 'solid 3px rgba(0, 0, 155, 0.5)';
        } else {
            easy.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            easy.style.border = 'solid 3px rgba(0, 0, 155, 0.5)';
            medium.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
            medium.style.border = 'solid 3px rgba(0, 0, 155, 0.5)';
            hard.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
            hard.style.border = 'solid 5px rgba(0, 0, 155, 0.8)';
        }
        this._difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    }

    get play() {
        return this._play;
    }

    set play(value) {
        this._play = value;
    }

    get difficulty() {
        return this._difficulty;
    }
}

class MonsterLifeBar {
    constructor(){        
        this._monsterLife = 100;
        this._monsterLifeBar = document.createElement('div');
        this._monsterLifeBar.style.position = 'absolute';
        this._monsterLifeBar.style.left = '50%';
        this._monsterLifeBar.style.top = '40px';
        this._monsterLifeBar.style.transform = 'translateX(-50%)';
        this._monsterLifeBar.style.width = '500px';
        this._monsterLifeBar.style.height = '25px';
        this._monsterLifeBar.style.border = 'solid 3px white';
        this._monsterLifeBar.style.borderRadius = '5px';
        document.body.appendChild(this._monsterLifeBar);

        this._divs = [];
        for(let i = 0; i < 100; i++){
            const life = document.createElement('div');
            life.style.width = '5px';
            life.style.height = '25px';
            life.style.backgroundColor = 'rgba(240, 0, 0, 0.8)';
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
        this._time = 15;
        this._timer = document.createElement('div');
        this._timer.style.position = 'absolute';
        this._timer.style.right = '50px';
        this._timer.style.top = '35px';
        this._timer.style.color = 'white';
        this._timer.style.fontSize = '35px';
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

    update(transformed){
        if(!transformed){
            this._timer.style.display = 'none';
            return;
        }
        this._timer.style.display = 'block';
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