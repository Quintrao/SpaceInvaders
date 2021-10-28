// const { create } = require("domain");

// import * as Phaser from "./phaser.js"

const tutorialText = [
  "Попади выстрелом \nв надпись \n\nСтрелять - пробелом",
  "      Ау, как больно \n\n      Ещё раз",
  "       И ещё",
];

const aliens = [
  {
    rows: [5],
    texture: "enemy-white",
    height: 50,
    width: 50,
    HP: 3,
  },

  {
    rows: [3, 4, 3],
    texture: "enemy-white",
    height: 50,
    width: 50,
    HP: 3,
  },

  {
    rows: [4, 5, 4],
    texture: "enemy-white",
    height: 50,
    width: 50,
    HP: 2,
  },
  {
    rows: [5, 4, 5],
    texture: "enemy-white",
    height: 50,
    width: 50,
    HP: 2,
  },
];

const ship = {
  reload: 400,
  speed: 80,
  damage: 1,
};

let sec = true;
let config = {
  type: Phaser.AUTO,
  height: window.innerHeight,
  width: window.innerWidth,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

if (config.width > config.height * 0.6) {
  config.width = config.height * 0.6;
}
console.log(config.height, config.width);
const tab = config.height / 6;
console.log(tab);

const game = new Phaser.Game(config);

function preload() {
  this.load.image("ship", "img/ship.png");
  this.load.image("enemy-white", "img/enemy-white.png");
  this.load.image("bullet", "img/bullet.png");
  this.load.image("star", "img/star.png");
  this.load.image("banner", "img/banner.png");
}

function create() {
  gameOver = false;
  count = 0;
  wave = 0;
  k = 0;
  enemies = [];
  tutorialActive = true;

  player = this.physics.add.sprite(config.width/2, config.height*5/6, "ship");
  player.setDisplaySize(tab/2, tab/2);
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  const hello = () => {
    tutorial = this.physics.add.sprite(
      config.width / 2,
      config.height / 4,
      "banner"
    );
    tutorial
      .setDisplaySize(config.width * 0.75, config.height * 0.4)
      .setImmovable(true);

    let x = (config.width / 4) * 1.2;
    let y = config.height * 0.2;

    console.log(x, y);
    console.log(tutorial.x, tutorial.y);
    console.log(tutorial.displayWidth, tutorial.displayHeight);

    let greet = this.add.text(x, y, tutorialText[0], {
      fontFamily: 'Roboto ,"Times New Roman", sans-serif',
      fontSize: 18,
      color: "#fff",
      align: "center",
      verticalAlign: "center",
    });

    return greet;
  };

  currentText = hello();

  space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  window.addEventListener("deviceorientation", handleOrientation, true);

  let message = this.add.text(100, 550, "RRR", {
    fontFamily: 'Roboto ,"Times New Roman", sans-serif',
    fontSize: 32,
    color: "#f00",
    align: "center",
    verticalAlign: "center",
  });

  function handleOrientation(event) {
    const alpha = Math.floor(event.alpha);
    const beta = Math.floor(event.beta);
    const gamma = Math.floor(event.beta);

    message.text = alpha + "        " + beta + "      " + gamma + "     ";
  }

  window.addEventListener("touchstart", shotTouch, true);

  function shotTouch(event) {
    shot(window);
  }
}

function update() {
  const createWave = (wave) => {
    const image = wave.texture;
    let invaders = [];
    let width = wave.width;
    let height = width;
    for (let k = 0; k < wave.rows.length; k++)
      if (wave.rows[k]) {
        let x = (config.width - width * wave.rows[k]) / 2;
        for (let i = 0; i < wave.rows[k]; i++) {
          const invader = this.physics.add.sprite(
            x + i * width * 1.3,
            width * (k + 1),
            image
          );
          invader.setDisplaySize(height, width);
          invader.setImmovable();
          invader.HP = wave.HP;
          invader.setVelocityY(10).setVelocityX(-20);

          invaders.push(invader);
        }
      }
    return invaders;
  };

  if (!count && !tutorialActive && !gameOver) {
    enemies = createWave(aliens[0]);
    count = enemies.length;
  }

  cursors = this.input.keyboard.createCursorKeys();
  if (cursors.left.isDown) {
    player.setVelocityX(-ship.speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(ship.speed);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-ship.speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(ship.speed);
  } else {
    player.setVelocityY(0);
  }

  if (space.isDown && sec) {
    sec = false;
    shot(this);
    setTimeout(() => (sec = true), ship.reload);
  }

  const createBonus = (x, y) => {
    bonus = this.physics.add.sprite(x, y, "star");
    bonus.setDisplaySize(50, 50);
    bonus.setVelocityY(100);
    this.physics.add.collider(bonus, player, speedIncrease, null, this);

    function speedIncrease() {
      ship.reload = ship.reload * 0.8;
      console.log(ship.reload);
      setTimeout(() => {
        (ship.reload * 10) / 8;
      }, 5000);
      bonus.disableBody(true, true);
    }
  };

  enemies.map((el) => {
    if (el.x - el.displayWidth / 2 < 0) {
      enemies.map((el) => el.setVelocityX(20));
    }

    if (el.x > config.width - el.displayWidth / 2) {
      enemies.map((el) => el.setVelocityX(-20));
    }
  });

  let death = () => {
    enemies.map((el) => el.setVelocityX(0).setVelocityY(0));
    player.disableBody(true, true);
    this.add
      .text(100, 400, "GAME OVER")
      .setFontFamily("Arial")
      .setFontSize(32)
      .setColor("#ffff00");
  };

  this.physics.add.collider(player, enemies, death, null, this);

  function shot(item) {
    bullet = item.physics.add.sprite(
      player.x,
      player.y - player.displayHeight / 2,
      "bullet"
    );
    bullet.setDisplaySize(5, 25);
    bullet.setVelocityY(-300);
    bullet.setBounce(2);

    const nextGreet = () => {
      bullet.disableBody(true, true);
      tutorial.setTintFill(0xff0000);
      setTimeout(() => {
        tutorial.clearTint();
      }, 50);
      k++;
      currentText.text = tutorialText[k];
      console.log(k);
      if (k === tutorialText.length) {
        tutorial.disableBody(true, true);
        wave = 0;
        tutorialActive = false;
      }
    };
    // console.log(tutorial.height, tutorial.width);

    item.physics.add.collider(bullet, tutorial, nextGreet, null, this);
    item.physics.add.collider(bullet, enemies, hitAlien, null, this);
    if (tutorialActive) {
      // console.log(tutorial.x, tutorial.y)
    }

    function hitAlien(bullet, enemy) {
      enemy.setTintFill(0xff0000);
      setTimeout(() => {
        enemy.clearTint();
      }, 100);
      bullet.disableBody(true, true);
      enemy.HP -= 1;
      console.log(enemy.HP);
      let x = enemy.x;
      let y = enemy.y;
      if (enemy.HP === 0) {
        enemy.disableBody(true, true);
        count -= 1;
      }

      if (count === 0) {
        createBonus(x, y);
        wave++;
        console.log(wave);
        if (aliens[wave]) {
          enemies = createWave(aliens[wave]);
          count = enemies.length;
        } else {
          gameOver = true;
          item.add
            .text(100, 400, "YOU WIN")
            .setFontFamily("Arial")
            .setFontSize(32)
            .setColor("#ffff00");
        }
      }
    }
  }
}
