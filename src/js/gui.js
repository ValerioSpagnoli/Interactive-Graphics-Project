class HealtBar {
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
}

class StarCounter {
    constructor() {
        this._numOfStars = 0;
        this._starCounter = document.createElement('div');
        this._starCounter.style.position = 'absolute';
        this._starCounter.style.right = '150px';
        this._starCounter.style.top = '50px';
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
}

class GameOver {
    constructor() {
        this._gameOver = document.createElement('div');
        this._gameOver.style.position = 'absolute';
        this._gameOver.style.left = '50%';
        this._gameOver.style.top = '50%';
        this._gameOver.style.transform = 'translate(-50%, -50%)';
        this._gameOver.style.color = 'white';
        this._gameOver.style.fontSize = '400px';
        this._gameOver.style.fontFamily = 'Handjet';
        this._gameOver.innerHTML = 'Game Over';

        // add a layer on the screen red and semi-transparent to hide the game when it's over
        this._layer = document.createElement('div');
        this._layer.style.position = 'absolute';
        this._layer.style.left = '0';
        this._layer.style.top = '0';
        this._layer.style.width = '100%';
        this._layer.style.height = '100%';
        this._layer.style.backgroundColor = 'rgba(30, 0, 0, 0.5)';
        this._layer.style.display = 'none';
        document.body.appendChild(this._layer);
        document.body.appendChild(this._gameOver);
    }

    show() {
        this._gameOver.style.display = 'block';
        this._layer.style.display = 'block';
    }

    hide() {
        this._gameOver.style.display = 'none';
        this._layer.style.display = 'none';
    }
}

export class GUI {
    constructor() {
        this._healthBar = new HealtBar();
        this._powerBar = new PowerBar();
        this._starCounter = new StarCounter(); 
        this._gameOver = new GameOver(); 
        this._gameOver.hide();
    }

    get healtBar() {
        return this._healthBar;
    }

    get powerBar() {
        return this._powerBar;
    }

    get starCounter() {
        return this._starCounter;
    }

    get gameOver() {
        return this._gameOver;
    }
}