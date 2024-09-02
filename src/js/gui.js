class Key {
    constructor(key, x, y) {
        this._key = key;
        this._x = x;
        this._y = y;
        this._keyElement = document.createElement('div');
        this._keyElement.style.position = 'absolute';
        this._keyElement.style.left = `${this._x}px`;
        this._keyElement.style.top = `${this._y}px`;
        this._keyElement.style.color = 'white';
        this._keyElement.style.fontSize = '30px';
        this._keyElement.innerHTML = this._key;
        document.body.appendChild(this._keyElement);
    }

    set color(color) {
        this._keyElement.style.color = color;
    }
}

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

export class GUI {
    constructor() {
        this._keys = {
            w: new Key('w', 60, 50),
            a: new Key('a', 30, 80),
            s: new Key('s', 60, 80),
            d: new Key('d', 90, 80),
            shift: new Key('shift', 130, 50),
            space: new Key('space', 130, 80),
        };

        this._healthBar = new HealtBar();
        this._powerBar = new PowerBar();
    }

    get healtBar() {
        return this._healthBar;
    }

    get powerBar() {
        return this._powerBar;
    }

    setKeyColor(key, color) {
        this._keys[key].color = color;
    }

    updateKey(key, isPressed) {
        if (isPressed) {
            this.setKeyColor(key, 'red');
        } else {
            this.setKeyColor(key, 'white');
        }
    }

    updateKeys(keys) {
        for (const key in keys) {
            this.updateKey(key, keys[key]);
        }
    }

    show() {
        for (const key in this._keys) {
            this._keys[key];
        }
    }

    hide() {
        for (const key in this._keys) {
            this._keys[key];
        }
    }

    remove() {
        for (const key in this._keys) {
            this._keys[key].remove();
        }
    }

}